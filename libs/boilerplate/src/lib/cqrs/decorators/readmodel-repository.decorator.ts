import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ObjectTypeEnum } from '../../config/object-type.enum';
import { ReadmodelEnum } from '../../config/readmodel.enum';

/**
 * Decorator to set the readmodel
 * for an readmodel repository to enable database communication
 * 
 * @param readmodel read model name used to access corresponding read model table in the database
 * @param denormalizedReadmodelDocumentClass read model class name used to parse the document from the database
 * @returns
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ReadmodelRepository = (readmodel: ReadmodelEnum, denormalizedReadmodelDocumentClass?: any) => {
    const decorators = [SetMetadata(ObjectTypeEnum.READMODEL_TABLE, readmodel)];
    if (denormalizedReadmodelDocumentClass) {
        decorators.push(SetMetadata(ObjectTypeEnum.READMODEL_CLASS, denormalizedReadmodelDocumentClass),);
    }

    return applyDecorators(...decorators);
}