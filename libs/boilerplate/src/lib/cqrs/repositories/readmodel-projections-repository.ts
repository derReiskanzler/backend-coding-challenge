import { Injectable } from '@nestjs/common';
import { ReadmodelProjections } from '../../cqrs/database-abstractions/readmodel-projections';
import { ReadmodelEnum } from '../../config/readmodel.enum';
import { EntityManagerSingleton } from '../../event-sourcing/singletons/entity-manager.singleton';

@Injectable()
export class ReadmodelProjectionsRepository {
    public async resetReadmodelProjection(readmodel: ReadmodelEnum): Promise<void> {
        const entityManager = EntityManagerSingleton.getInstance().getEntityManager();
        const repository = entityManager.getRepository(ReadmodelProjections);
        
        const offset = await repository.findOne({ where: { readmodel } });
        if (!offset) return;

        await repository.save({
            ...offset,
            lastProcessedEventId: null,
            processedEventCount: 0,
        });
    }
}