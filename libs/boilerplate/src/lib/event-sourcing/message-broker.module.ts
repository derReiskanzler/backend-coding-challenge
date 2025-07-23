import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaClientOptions } from './message-broker.config';
import { EventPublisherProvider } from './providers/event-publisher.provider';

const PROVDERS = [
  EventPublisherProvider,
];

@Module({
  providers: [
    ...PROVDERS,
  ],
  imports: [
    ClientsModule.register([kafkaClientOptions]),
  ],
  exports: [
    ClientsModule,
    ...PROVDERS,
  ],
})
export class MessageBrokerModule {}
