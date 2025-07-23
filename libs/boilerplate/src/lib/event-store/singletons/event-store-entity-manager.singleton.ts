import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class EventStoreEntityManagerSingleton {
    private static instance: EventStoreEntityManagerSingleton;

    private constructor(
        private readonly entityManager: EntityManager,
    ) {}

    public static initialize(entityManager: EntityManager): void {
        if (!EventStoreEntityManagerSingleton.instance) {
            EventStoreEntityManagerSingleton.instance = new EventStoreEntityManagerSingleton(
                entityManager,
            );
        }
    }

    public static getInstance(): EventStoreEntityManagerSingleton {
        return EventStoreEntityManagerSingleton.instance;
    }

    public getEntityManager(): EntityManager {
        return this.entityManager;
    }
}
