import { Injectable, Logger } from '@nestjs/common';
import { EntityManagerSingleton } from '../../event-sourcing/singletons/entity-manager.singleton';
import { ObjectTypeEnum } from '../../config/object-type.enum';
import { ReadmodelDocument } from '../models/readmodel-document';
import { ReadmodelProjections } from '../database-abstractions/readmodel-projections';
import { BaseReadmodel } from '../database-abstractions/base-readmodel';
import { Metadata } from '../../event-sourcing/models/metadata.model';
import { EntityManager } from 'typeorm';

@Injectable()
export abstract class ReadmodelWriteRepository {
    private readonly logger = new Logger(ReadmodelWriteRepository.name);
    
    protected async upsertDocument(id: string, document: ReadmodelDocument, eventId: string, meta: Metadata): Promise<void> {
        const readmodel = Reflect.getMetadata(ObjectTypeEnum.READMODEL_TABLE, this.constructor);
        if (!readmodel) {
            this.logger.error('Readmodel attribute not provided');
            throw new Error('Readmodel attribute not provided');
        }

        if (typeof readmodel !== 'string') {
            this.logger.error('Readmodel attribute is not of type string');
            throw new Error('Readmodel attribute is not of type string');
        }

        const ReadmodelClass = Reflect.getMetadata(ObjectTypeEnum.READMODEL_CLASS, this.constructor);
        if (!ReadmodelClass) {
            this.logger.error('Readmodel class attribute not provided');
            throw new Error('Readmodel class attribute not provided');
        }

        if (!(ReadmodelClass.prototype instanceof ReadmodelDocument)) {
            this.logger.error('Readmodel class does not extend ReadmodelDocument');
            throw new Error('Readmodel class does not extend ReadmodelDocument');
        }
        
        const entityManager = EntityManagerSingleton.getInstance().getEntityManager();
        try {
            await entityManager.transaction(async manager => {
                const readmodelRepository = manager.getRepository(readmodel);

                const existing = await readmodelRepository.findOne({ where: { id } }) as BaseReadmodel;
                if (existing) {
                    const existingAssigned = Object.assign(new ReadmodelClass(), existing.document);
                    const updatedDocument = existingAssigned.with(document.toRecordData());
                    await readmodelRepository.save({
                        ...existing,
                        document: updatedDocument.toRecordData(),
                    });
                } else {
                    await readmodelRepository.save({
                        id,
                        document: document.toRecordData(),
                        meta,
                        createdAt: new Date(),
                    });
                }
    
                await this.updateProjectionOffset(manager, readmodel, eventId);
            });
        } catch (error) {
            this.logger.error(`Failed to save readmodel document: ${error.message}`);
        }
        
    }

    protected async deleteDocument(id: string, eventId: string): Promise<void> {
        const readmodel = Reflect.getMetadata(ObjectTypeEnum.READMODEL_TABLE, this.constructor);
        if (!readmodel) {
            this.logger.error('Readmodel attribute not provided');
            throw new Error('Readmodel attribute not provided');
        }

        if (typeof readmodel !== 'string') {
            this.logger.error('Readmodel attribute is not of type string');
            throw new Error('Readmodel attribute is not of type string');
        }

        const entityManager = EntityManagerSingleton.getInstance().getEntityManager();
        try {
            entityManager.transaction(async manager => {
                const readmodelRepository = manager.getRepository(readmodel);
                await readmodelRepository.delete({ id });

                await this.updateProjectionOffset(manager, readmodel, eventId);
            });
        } catch (error) {
            this.logger.error(`Failed to delete readmodel document: ${error.message}`);
        }
    }

    private async updateProjectionOffset(manager: EntityManager, readmodel: string, eventId: string): Promise<void> {
        try {
            const projectionOffsetRepository = manager.getRepository(ReadmodelProjections);
            const projection = await projectionOffsetRepository.findOne({ where: { readmodel } });
            if (projection) {
                await projectionOffsetRepository.save({
                    ...projection,
                    lastProcessedEventId: eventId,
                    processedEventCount: projection.processedEventCount + 1,
                });
            } else {
                await projectionOffsetRepository.save({
                    readmodel,
                    lastProcessedEventId: eventId,
                    processedEventCount: 1,
                });
            }
        } catch (error) {
            this.logger.error(`Failed to save readmodel projection offset: ${error.message}`);
        }
    }
}