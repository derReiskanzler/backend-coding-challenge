import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { MicroserviceOptions } from '@nestjs/microservices';

export const MessageBrokerInjectionToken = 'KAFKA_SERVICE';

export const microserviceKafkaOptions: MicroserviceOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
    },
  },
};

export const kafkaClientOptions: ClientProviderOptions = {
  name: MessageBrokerInjectionToken,
  ...microserviceKafkaOptions,
};