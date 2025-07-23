import { Command } from '../../cqrs/models/command';
import { Injectable, Logger } from '@nestjs/common';
import { AggregateRoot } from '../aggregate/aggregate-root';
import { EventPublisherSingleton } from '../../event-sourcing/singletons/event-publisher.singleton';
import { EventStoreEntityManagerSingleton } from '../../event-store/singletons/event-store-entity-manager.singleton';
import { ObjectTypeEnum } from '../../config/object-type.enum';
import { EntityManagerSingleton } from '../../event-sourcing/singletons/entity-manager.singleton';
import { Metadata } from '../../event-sourcing/models/metadata.model';

@Injectable()
export abstract class AggregateWriteRepository {
    private readonly logger = new Logger(AggregateWriteRepository.name);
    
    protected async saveAggregate(aggregate: AggregateRoot, command: Command): Promise<void> {
        if (aggregate.getPendingEvents().length === 0) return;

        const eventStream = Reflect.getMetadata(
            ObjectTypeEnum.EVENT_STREAM,
            this.constructor,
        );
        if (!eventStream) {
            this.logger.error('Event stream attribute not provided');
            throw new Error('Event stream attribute not provided');
        }

        const meta = {
            causationId: command.getCommandId(),
            causationName: command.getCommandName(),
        } as Metadata;
        const normalizedEvents = aggregate.normalizeEvents(meta);

        try {
            const eventStoreEntityManager = EventStoreEntityManagerSingleton
                .getInstance()
                .getEntityManager();

            await eventStoreEntityManager.transaction(async manager => {
                await manager.save(eventStream, normalizedEvents)
                
                await this.saveAggregateState(aggregate);
            });
        } catch (error) {
            this.logger.error(`Failed to save aggregate: ${error.message}`);
            throw error;
        }

        await EventPublisherSingleton
            .getInstance()
            .publish(eventStream, normalizedEvents);

        aggregate.commitEvents();
    }

    protected async saveAggregateState(aggregate: AggregateRoot): Promise<void> {
        const entityManager = EntityManagerSingleton
            .getInstance()
            .getEntityManager();

        await entityManager.transaction(async manager => {
            const aggregateState = aggregate.normalizeState();
            const aggregateStateTable = Reflect.getMetadata(
                ObjectTypeEnum.AGGREGATE_STATE_TABLE,
                this.constructor,
            );
            if (!aggregateStateTable) {
                this.logger.error('Aggregate state table attribute not provided');
                throw new Error('Aggregate state table attribute not provided');
            }
            await manager.save(aggregateStateTable, aggregateState);
        });
    }
}