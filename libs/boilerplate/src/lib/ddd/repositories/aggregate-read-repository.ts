import { Injectable, Logger } from '@nestjs/common';
import { ObjectTypeEnum } from '../../config/object-type.enum';
import { EventStoreEntityManagerSingleton } from '../../event-store/singletons/event-store-entity-manager.singleton';
import { AggregateRoot } from '../aggregate/aggregate-root';
import { AggregateState } from '../aggregate/aggregate-state';
import { BaseStreamEvent } from '../../event-sourcing/database-abstractions/base-stream-event';
import { BaseAggregateState } from '../database-abstractions/base-aggregate-state';
import { ReadModeEnum } from '../../config/read-mode.enum';
import { EntityManagerSingleton } from '../../event-sourcing/singletons/entity-manager.singleton';

@Injectable()
export abstract class AggregateReadRepository {
    private readonly logger = new Logger(AggregateReadRepository.name);

    /**
     * Get an aggregate by id; tries to load aggregate by fetching the state, otherwise from its events
     * @param query 
     * @returns 
     */
    protected async getAggregate<T extends AggregateRoot>(id: string): Promise<T|null> {
        const readMode = Reflect.getMetadata(ObjectTypeEnum.READ_MODE, this.constructor);
        
        if (readMode === ReadModeEnum.FROM_STATE) {
           return await this.getAggregateFromState<T>(id);
        } else {
            return await this.getAggregateFromEvents<T>(id);
        }
    }

    private async getAggregateFromState<T extends AggregateRoot>(id: string): Promise<T|null> {
        const entityManager = EntityManagerSingleton.getInstance().getEntityManager();

        const aggregateStateRepository = entityManager.getRepository(Reflect.getMetadata(ObjectTypeEnum.AGGREGATE_STATE_TABLE, this.constructor));
        const aggregateState = await aggregateStateRepository.createQueryBuilder('state')
            .where('state.state::jsonb @> :state', { state: { id } })
            .getOne() as BaseAggregateState;
        
        if (aggregateState) {
            const AggregateStateClass = Reflect.getMetadata(ObjectTypeEnum.AGGREGATE_STATE_CLASS, this.constructor);

            if (!(AggregateStateClass.prototype instanceof AggregateState)) {
                this.logger.error('Aggregate state class does not extend AggregateState');
                throw new Error('Aggregate state class does not extend AggregateState');
            }

            const AggregateClass = Reflect.getMetadata(ObjectTypeEnum.AGGREGATE_CLASS, this.constructor);
            if (!AggregateClass) {
                this.logger.error('Aggregate class attribute not provided');
                throw new Error('Aggregate class attribute not provided');
            }

            const aggregate = AggregateClass.reconstituteFromState(aggregateState, AggregateStateClass) as T;
            return aggregate;
        }

        return null;
    }

    private async getAggregateFromEvents<T extends AggregateRoot>(id: string): Promise<T|null> {
        const eventStream = Reflect.getMetadata(ObjectTypeEnum.EVENT_STREAM, this.constructor);
        if (!eventStream) {
            this.logger.error('Event stream not provided');
            throw new Error('Event stream not provided');
        }

        const entityManager = EventStoreEntityManagerSingleton.getInstance().getEntityManager();

        const eventStreamRepository = entityManager.getRepository(eventStream);
        const eventEntities = await eventStreamRepository.createQueryBuilder('event')
            .where('event.payload::jsonb @> :payload', { payload: { id } })
            .getMany() as BaseStreamEvent[];

        if (eventEntities.length === 0) {
            return null;
        }

        const AggregateClass = Reflect.getMetadata(ObjectTypeEnum.AGGREGATE_CLASS, this.constructor);
        if (!AggregateClass) {
            this.logger.error('Aggregate class attribute not provided');
            throw new Error('Aggregate class attribute not provided');
        }

        if (!(AggregateClass.prototype instanceof AggregateRoot)) {
            this.logger.error('Aggregate class does not extend AggregateRoot');
            throw new Error('Aggregate class does not extend AggregateRoot');
        }

        const aggregate = new AggregateClass() as T;
        const eventMapping = Reflect.getMetadata(ObjectTypeEnum.EVENT_MAPPING, this.constructor);
        if (!eventMapping) {
            this.logger.error('Event mapping not provided');
            throw new Error('Event mapping not provided');
        }
        aggregate.replay(eventEntities, eventMapping);

        return aggregate;
    }
}