import { Inject, Injectable, Provider } from '@nestjs/common';
import { EventPublisherSingleton } from '../singletons/event-publisher.singleton';
import { ClientKafka } from '@nestjs/microservices';
import { MessageBrokerInjectionToken } from '../message-broker.config';

@Injectable()
class EventPublisherFactory {
    constructor(
        @Inject(MessageBrokerInjectionToken) private readonly client: ClientKafka,
    ) {
        EventPublisherSingleton.initialize(this.client);
    }
}

export const EventPublisherProvider: Provider = {
    provide: EventPublisherSingleton,
    useClass: EventPublisherFactory,
};