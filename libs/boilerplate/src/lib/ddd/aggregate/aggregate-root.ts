/* eslint-disable @typescript-eslint/no-explicit-any */
import { AggregateVersion } from './aggregate-version';
import { DomainEvent } from '../../event-sourcing/models/domain-event';
import { UuidGenerator } from '../../util/uuid-generator/uuid-generator';
import { BaseStreamEvent } from '../../event-sourcing/database-abstractions/base-stream-event';
import { BaseAggregateState } from '../database-abstractions/base-aggregate-state';
import { AggregateState } from './aggregate-state';
import { AggregateId } from './aggregate-id';
import { Metadata } from '../../event-sourcing/models/metadata.model';

export interface AggregateEventRecordOptions {
    fromHistory?: boolean;
}

export abstract class AggregateRoot {
    private readonly pendingEvents: DomainEvent[] = [];
    private version: AggregateVersion;
    protected state: AggregateState;

    constructor() {
        this.version = AggregateVersion.zero();
    }

    public abstract getAggregateId(): AggregateId;

    public getState(): AggregateState {
        return this.state;
    }

    /**
     * Returns the uncommitted events that are stored in the aggregate
     * @returns uncommitted events
     */
    public getPendingEvents(): DomainEvent[] {
        return this.pendingEvents;
    }

    /**
     * Commits the events to the aggregate and clears the internal event list
     */
    public commitEvents(): void {
        this.pendingEvents.length = 0;
    }

    /**
     * Converts event models (domain layer) to base stream event models (entities)
     * so it can be saved to the database (infrastructure layer)
     * 
     * @param events events to be transformed to base stream events
     * @param command command to be saved along with the events to map causation to recorded events
     * @returns base stream events that contains the event properties
     */
    public normalizeEvents(meta: Metadata): BaseStreamEvent[] {
        return this.pendingEvents.map(event => {
            this.version = this.version.increment();
            return this.normalizeEvent(event, meta);
        });
    }

    /**
     * Records a domain event on the aggregate
     * and calls the respective 'on[Event]' event handler method in the aggregate
     * 
     * @param event domain event to be recorded resp. added to the internal aggregate event list
     * @param options 
     */
    public recordThat(
        event: DomainEvent,
        options: AggregateEventRecordOptions = {fromHistory: false},
    ): void {
        if (!options?.fromHistory) {
            this.pendingEvents.push(event);
        }

        const handler = this.getApplyOnStateHandler(event);
        if (handler) {
            handler.call(this, event);
        }
    }

    /**
     * Replays the events from the database on the aggregate without recording them again,
     * but calling the respective event handler methods to update the aggregate state
     * 
     * @param entityEvents events from database to be replayed
     * @param options options for the record process; required to be passed since event mapping flag is needed
     */
    public replay(
        entityEvents: BaseStreamEvent[],
        eventMapping: Record<string, any>,
    ): void {
        entityEvents.forEach(event => {
            const domainEvent = this.denormalizeEvent(event, eventMapping);
            this.recordThat(domainEvent, { fromHistory: true });
            this.version = AggregateVersion.fromNumber(event.version);
        });
    }
    
    /**
     * Converts the aggregate state to a base state table model
     * so it can be saved to the database (infrastructure layer)
     * 
     * @returns base state table model to be saved in the database
     */
    public normalizeState(): BaseAggregateState {
        return {
            id: this.getAggregateId().toString(),
            version: this.version.toNumber(),
            state: this.state.toRecordData(),
            createdAt: new Date(),
        };
    }

    /**
     * Creates and returns an aggregate with a state from the state table model
     * 
     * @param this represents generic aggregate class that extends from AggregateRoot
     * @param state state table model to be loaded to the aggregate
     * @param stateConstructor  constructor of the state class to be loaded
     * @returns
     */
    public static reconstituteFromState<T extends AggregateState>(
        this: new () => AggregateRoot,
        state: BaseAggregateState,
        stateConstructor: { new (): T; fromRecordData(data: any): T }
    ): AggregateRoot {
        const aggregate = new this();
        aggregate.version = AggregateVersion.fromNumber(state.version);
        aggregate.state = stateConstructor.fromRecordData(state.state);
        
        return aggregate;
    }

    /**
     * Converts event models (domain layer) to base stream event models (entities)
     * so it can be saved to the database (infrastructure layer)
     * 
     * @param event event to be transformed to a base stream event
     * @param command command to be saved along with the event to map causation to recorded event
     * @returns base stream event that contains the event properties
     */
    private normalizeEvent(event: DomainEvent, meta: Metadata): BaseStreamEvent {
        const { createdAt, ...payload } = event.normalize();

        return {
            eventId: UuidGenerator.generate(),
            eventName: event.getEventName(),
            createdAt,
            meta,
            payload,
            version: this.version.toNumber(),
        };
    }

    /**
     * Converts base stream event models (entities - infrastructure layer) to event models (domain layer)
     * 
     * @param event event to be transformed to a base stream event
     * @param eventMapping event map to find the respective domain event class for the base stream event
     * @returns base stream event that contains the event properties
     */
    private denormalizeEvent(
        entityEvent: BaseStreamEvent,
        eventMapping: Record<string, any>,
    ): DomainEvent {
        const { eventName, payload, createdAt } = entityEvent;
        const EventClass: { denormalize: (data: Record<string, any>) => DomainEvent } = eventMapping[eventName];

        if (!EventClass) {
            throw new Error(`Unsupported event type: ${eventName}`);
        }

        const eventInstance = EventClass.denormalize({...payload, createdAt});

        return eventInstance;
    }

    /**
     * Returns the event handler method based on the event name
     * example: 'onProspectSignedUpEvent' - for 'ProspectSignedUpEvent'
     * 
     * @param event domain event
     * @returns callable method on aggregate
     */
    private getApplyOnStateHandler(event: DomainEvent): any | undefined {
        const handler = `on${this.getEventName(event)}`;
        return (this as any)[handler];
    }

    /**
     * Returns the event name from the event class
     * 
     * @param event domain event
     * @returns 
     */
    private getEventName(event: DomainEvent): string {
        const { constructor } = Object.getPrototypeOf(event);
        return constructor.name as string;
    }
}