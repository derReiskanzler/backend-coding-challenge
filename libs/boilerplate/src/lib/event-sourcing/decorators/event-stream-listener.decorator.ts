import { applyDecorators, ArgumentMetadata } from '@nestjs/common';
import { EventStreamEnum } from '../../config/event-stream.enum';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ParseArrayPipe } from '@nestjs/common';
import { BaseStreamEvent } from '../database-abstractions/base-stream-event';

export const EventStreamListener = (eventStream: EventStreamEnum) => {
    return applyDecorators(EventPattern(eventStream));
}
export const EventStreamPayload = () => {
    return Payload({
        transform: async (value: BaseStreamEvent[]|undefined, metadata: ArgumentMetadata): Promise<BaseStreamEvent> => {
            if (!value || !Array.isArray(value)) throw new Error(`Invalid base stream event: '${value}'`);

            const parsedArray = await new ParseArrayPipe({ items: Object, separator: ',' }).transform(value, metadata);
            return parsedArray[0];
        }
    });
}

