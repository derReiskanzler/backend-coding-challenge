import { Module } from '@nestjs/common';
import { EventStreamReadRepository } from './repositories/event-stream-read-repository';
import { EventStoreEntityManagerProvider } from './providers/event-store-entity-manager.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthAccountsV1Stream } from './event-streams/auth-accounts-v1.event-stream';
import { MovieRatingMovieRatingsV1Stream } from './event-streams/movie-rating-movie-ratings-v1.event-stream';
import { EventStoreName } from './event-store.config';

const PROVIDERS = [
    EventStoreEntityManagerProvider,
];

const REPOSITORIES = [
    EventStreamReadRepository,
];

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: EventStoreName,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('event_store.host'),
                port: configService.get<number>('event_store.port'),
                username: configService.get<string>('event_store.username'),
                password: configService.get<string>('event_store.password'),
                database: configService.get<string>('event_store.database'),
                entities: [
                    AuthAccountsV1Stream,
                    MovieRatingMovieRatingsV1Stream,
                ],
                synchronize: true,
                logging: configService.get<string>('event_store.logging') === 'true',
                ssl: configService.get<boolean>('event_store.ssl'),
                connectTimeoutMS: 30000,
                poolSize: 10,
            }),
        }),
    ],
    providers: [
        ...PROVIDERS,
        ...REPOSITORIES,
    ],
    exports: [
        ...PROVIDERS,
        ...REPOSITORIES,
    ],
})
export class EventStoreModule {}