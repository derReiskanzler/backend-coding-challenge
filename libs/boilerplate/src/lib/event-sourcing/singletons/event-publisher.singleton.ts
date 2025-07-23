import { Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { EventStreamEnum } from '../../config/event-stream.enum';
import { BaseStreamEvent } from '../database-abstractions/base-stream-event';

@Injectable()
export class EventPublisherSingleton {
    private static instance: EventPublisherSingleton;

    private constructor(private readonly client: ClientKafka) {}

    public static initialize(client: ClientKafka): void {
        if (!EventPublisherSingleton.instance) {
            EventPublisherSingleton.instance = new EventPublisherSingleton(client);
        }
    }

    public static getInstance(): EventPublisherSingleton {
        if (!EventPublisherSingleton.instance) {
            throw new Error('EventPublisherService is not initialized');
        }
        return EventPublisherSingleton.instance;
    }

    public publish(eventStream: EventStreamEnum, normalizedEvents: BaseStreamEvent[]): void {
        this.client.emit(eventStream, normalizedEvents);
    }
}