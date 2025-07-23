import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ObjectTypeEnum } from '../../config/object-type.enum';
import { ReadModeEnum } from '../../config/read-mode.enum';

export const AggregateReadMode = (mode?: string) => {
    mode = mode as ReadModeEnum;
    return applyDecorators(
        SetMetadata(ObjectTypeEnum.READ_MODE, mode),
    );
}
