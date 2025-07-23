import { Injectable } from '@nestjs/common';
import { EventStoreEntityManagerSingleton } from '../singletons/event-store-entity-manager.singleton';
import { BaseStreamEvent } from '../../event-sourcing/database-abstractions/base-stream-event';
import { EventStreamEnum } from '../../config/event-stream.enum';

@Injectable()
export class EventStreamReadRepository {
    public async getEventsFromStream(eventStream: EventStreamEnum): Promise<BaseStreamEvent[]> {
        const entityManager = EventStoreEntityManagerSingleton.getInstance().getEntityManager();

        const eventStreamRepository = entityManager.getRepository(eventStream);
        const eventEntities = await eventStreamRepository.createQueryBuilder('event')
            .getMany() as BaseStreamEvent[];

        return eventEntities;
    }

    public async getEventsFromStreamByAggregateId(
        eventStream: EventStreamEnum,
        aggregateId: string,
    ): Promise<BaseStreamEvent[]> {
        const entityManager = EventStoreEntityManagerSingleton.getInstance().getEntityManager();

        const eventStreamRepository = entityManager.getRepository(eventStream);
        const eventEntities = await eventStreamRepository.createQueryBuilder('event')
            .where('event.payload::jsonb @> :payload', { payload: { id: aggregateId } })
            .getMany() as BaseStreamEvent[];

        return eventEntities;
    }

    public async getEventsFromStreamByAggregateIdAndVersion(
        eventStream: EventStreamEnum,
        aggregateId: string,
        version: number,
    ): Promise<BaseStreamEvent[]> {
        const entityManager = EventStoreEntityManagerSingleton.getInstance().getEntityManager();

        const eventStreamRepository = entityManager.getRepository(eventStream);
        const eventEntities = await eventStreamRepository.createQueryBuilder('event')
            .where('event.payload::jsonb @> :payload', { payload: { id: aggregateId } })
            .andWhere('event.version <= :version', { version })
            .getMany() as BaseStreamEvent[];

        return eventEntities;
    }

    public async getEventsFromStreamByPayload(
        eventStream: EventStreamEnum,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: Record<string, any>,
    ): Promise<BaseStreamEvent[]> {
        const entityManager = EventStoreEntityManagerSingleton.getInstance().getEntityManager();

        const eventStreamRepository = entityManager.getRepository(eventStream);
        const eventEntities = await eventStreamRepository.createQueryBuilder('event')
            .where('event.payload::jsonb @> :payload', { payload })
            .getMany() as BaseStreamEvent[];

        return eventEntities;
    }
}