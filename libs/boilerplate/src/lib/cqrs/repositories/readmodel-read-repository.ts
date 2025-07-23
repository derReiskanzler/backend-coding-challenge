import { Injectable, Logger } from '@nestjs/common';
import { EntityManagerSingleton } from '../../event-sourcing/singletons/entity-manager.singleton';
import { ObjectTypeEnum } from '../../config/object-type.enum';
import { ReadmodelDocument } from '../models/readmodel-document';
import { Paging } from '../models/paging.model';
import { PagingDto } from '../dtos/paging.dto';
import { Sort, SortDirectionEnum } from '../models/sort.model';

@Injectable()
export abstract class ReadmodelReadRepository {
    private readonly logger = new Logger(ReadmodelReadRepository.name);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async getDocument<T extends ReadmodelDocument>(query: { id?: string; body?: Partial<Record<keyof T, T[keyof T]>> }): Promise<T | null> {
        const readmodel = Reflect.getMetadata(ObjectTypeEnum.READMODEL_TABLE, this.constructor);
        if (!readmodel) {
            this.logger.error('Readmodel attribute not provided');
            throw new Error('Readmodel attribute not provided');
        }

        if (typeof readmodel !== 'string') {
            this.logger.error('Readmodel attribute is not of type string');
            throw new Error('Readmodel attribute is not of type string');
        }

        const readmodelRepository = EntityManagerSingleton.getInstance().getEntityManager().getRepository(readmodel);
        const queryBuilder = readmodelRepository.createQueryBuilder('document');

        if (query.id) {
            queryBuilder.where('document.id = :id', { id: query.id });
        } else if (query.body) {
            queryBuilder.where('document.document @> :body', { body: query.body });
        } else {
            this.logger.error('No valid query provided');
            throw new Error('No valid query provided');
        }

        const document = await queryBuilder.getOne();

        if (!document) {
            return null;
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

        const denormalizedDoc = document.document;
        const assigned = Object.assign(new ReadmodelClass(), denormalizedDoc);

        return assigned;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async getDocuments<T extends ReadmodelDocument>(body?: Record<string, any>, paging?: Paging, sort?: Sort): Promise<PagingDto<T>>{
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
        
        const readmodelRepository = EntityManagerSingleton.getInstance().getEntityManager().getRepository(readmodel);
        const queryBuilder = readmodelRepository.createQueryBuilder('document');
        
        if (body && Object.keys(body).length) {
            const filteredBody = Object.fromEntries(
                Object.entries(body).filter(([_, value]) => value !== undefined)
            );
            if (Object.keys(filteredBody).length) {
                queryBuilder.where('document.document::jsonb @> :body', { body: filteredBody });
            }
        }
        
        if (sort?.direction && sort?.field) {
            queryBuilder.orderBy(`document.document->>'${sort.field}'`, sort.direction, sort.direction === SortDirectionEnum.DESC ? 'NULLS FIRST' : 'NULLS LAST');
        } else {
            queryBuilder.orderBy('document.createdAt', SortDirectionEnum.DESC, 'NULLS FIRST');
        }
        
        if (paging?.skip) {
            queryBuilder.skip(paging.skip);
        }
        
        if (paging?.take) {
            queryBuilder.take(paging.take);
        }

        const [documents, count] = await queryBuilder.getManyAndCount();

        const denormalizedDocuments = documents.map((doc) => Object.assign(new ReadmodelClass(), doc.document));

        return {
            data: denormalizedDocuments,
            meta: {
                skip: paging?.skip ? paging.skip : 0,
                take: paging?.take ? paging.take : count,
                count,
            },
        } as PagingDto<T>;
    }
}