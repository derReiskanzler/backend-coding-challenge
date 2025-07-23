import { Injectable, Provider } from '@nestjs/common';
import { EntityManagerSingleton } from '../singletons/entity-manager.singleton';
import { EntityManager } from 'typeorm';

@Injectable()
class EntityManagerFactory {
    constructor(private readonly entityManager: EntityManager) {
        EntityManagerSingleton.initialize(this.entityManager);
    }
}

export const EntityManagerProvider: Provider = {
    provide: EntityManagerSingleton,
    useClass: EntityManagerFactory,
};