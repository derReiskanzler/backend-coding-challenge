import { Module } from '@nestjs/common';
import { EventStreamReadRepository } from './repositories/event-stream-read-repository';
import { EventStoreEntityManagerProvider } from './providers/event-store-entity-manager.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
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
        TypeOrmModule.forRoot({
            name: EventStoreName,
            type: 'postgres',
            host: '127.0.0.1',
            port: 5432,
            username: 'root',
            password: 'root',
            database: 'postgres',
            entities: [
                AuthAccountsV1Stream,
                MovieRatingMovieRatingsV1Stream,
            ],
            synchronize: true,
            logging: false,
            ssl: false,
            connectTimeoutMS: 30000,
            poolSize: 10,
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