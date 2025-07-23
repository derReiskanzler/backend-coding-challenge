import { Injectable, Provider } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventStoreEntityManagerSingleton } from '../singletons/event-store-entity-manager.singleton';
import { EventStoreEntityManagerInjectionToken } from '../event-store.config';

@Injectable()
class EventStoreEntityManagerFactory {
    constructor(@InjectEntityManager(EventStoreEntityManagerInjectionToken) private readonly entityManager: EntityManager) {
        EventStoreEntityManagerSingleton.initialize(this.entityManager);
    }
}

export const EventStoreEntityManagerProvider: Provider = {
    provide: EventStoreEntityManagerSingleton,
    useClass: EventStoreEntityManagerFactory,
};