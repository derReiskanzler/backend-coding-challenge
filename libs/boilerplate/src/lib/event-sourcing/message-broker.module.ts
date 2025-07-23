import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageBrokerInjectionToken } from './message-broker.config';
import { EventPublisherProvider } from './providers/event-publisher.provider';

const PROVDERS = [
  EventPublisherProvider,
];

@Module({
  providers: [
    ...PROVDERS,
  ],
  imports: [
    ClientsModule.registerAsync([
      {
        name: MessageBrokerInjectionToken,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [`${configService.get<string>('message_broker.host')}:${configService.get<number>('message_broker.port')}`],
            },
          },
        }),
      },
    ]),
  ],
  exports: [
    ClientsModule,
    ...PROVDERS,
  ],
})
export class MessageBrokerModule {}
