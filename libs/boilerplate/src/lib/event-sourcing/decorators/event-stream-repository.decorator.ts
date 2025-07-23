import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ObjectTypeEnum } from '../../config/object-type.enum';
import { EventStreamEnum } from '../../config/event-stream.enum';

/**
 * Decorator to set the event stream and event mapping metadata
 * for an event stream repository to enable database communication
 * 
 * @param eventStream event stream name used to access corresponding event table in the database
 * @param eventMapping key value pair of event name and event class used for parsing the correct event from the database
 * @returns
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EventStreamRepository = (eventStream: EventStreamEnum, eventMapping?: Record<string, any>) => {
    const decorators = [ SetMetadata(ObjectTypeEnum.EVENT_STREAM, eventStream) ];
    if (eventMapping) {
        decorators.push(SetMetadata(ObjectTypeEnum.EVENT_MAPPING, eventMapping));
    }

    return applyDecorators(...decorators);
}