import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class EntityManagerSingleton {
    private static instance: EntityManagerSingleton;

    private constructor(
        private readonly entityManager: EntityManager,
    ) {}

    public static initialize(entityManager: EntityManager): void {
        if (!EntityManagerSingleton.instance) {
            EntityManagerSingleton.instance = new EntityManagerSingleton(
                entityManager,
            );
        }
    }

    public static getInstance(): EntityManagerSingleton {
        return EntityManagerSingleton.instance;
    }

    public getEntityManager(): EntityManager {
        return this.entityManager;
    }
}
