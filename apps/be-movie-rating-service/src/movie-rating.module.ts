import { Logger, Module } from '@nestjs/common';
import { HealthController } from './infrastructure/inbound/api/v1/health/health.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { AUTH_SERVICE, CqrsBoilerplateModule, EventSourcingBoilerplateModule, EventStoreModule, MessageBrokerModule, ReadmodelProjections } from '@backend-monorepo/boilerplate';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MovieRatingMovieRatingsV1StateTable } from './infrastructure/schemas/aggregate-state-tables/movie-rating-movie-ratings-v1-state.table';
import { MovieRatingMovieRatingsV1Readmodel } from './infrastructure/schemas/readmodels/movie-rating-users-v1.readmodel';
import { CreateMovieRatingV1Action } from './infrastructure/inbound/api/v1/movie-ratings/create-movie-rating/create-movie-rating.action';
import { MovieRatingV1WriteRepository } from './infrastructure/outbound/repository/v1/write/movie-rating-write.repository';
import { CreateMovieRatingCommandHandler } from './application/use-cases/create-movie-rating/create-movie-rating.command-handler';
import { MovieRatingRepositoryInterface as CreateMovieRatingRepositoryInterface } from './application/use-cases/create-movie-rating/movie-rating.repository.interface';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MovieRatingV1ReadmodelWriteRepository } from './infrastructure/outbound/repository/v1/write/movie-rating-readmodel-write.repository';
import { PopulateMovieRatingMovieRatingsProjector } from './infrastructure/inbound/projectors/v1/populate-movie-rating-movie-ratings.projector';
import { MovieRatingV1ReadmodelReadRepository } from './infrastructure/outbound/repository/v1/read/movie-rating-readmodel-read.repository';
import { GetMovieRatingDocumentRepositoryInterface } from './application/use-cases/get-movie-rating/get-movie-rating-document.repository.interface';
import { GetMovieRatingQueryHandler } from './application/use-cases/get-movie-rating/get-movie-rating.query-handler';
import { GetMovieRatingV1Action } from './infrastructure/inbound/api/v1/movie-ratings/get-movie-rating/get-movie-rating.action';
import { GetMovieRatingsQueryHandler } from './application/use-cases/get-movie-ratings/get-movie-ratings.query-handler';
import { GetMovieRatingsV1Action } from './infrastructure/inbound/api/v1/movie-ratings/get-movie-ratings/get-movie-ratings.action';
import { GetMovieRatingsDocumentRepositoryInterface } from './application/use-cases/get-movie-ratings/get-movie-ratings-document.repository.interface';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const lg = new Logger('TypeORM Config');
                lg.log('Loading TypeORM')
                const db: TypeOrmModuleOptions = {
                    type: 'postgres',
                    host: configService.get<string>('database.host'),
                    port: configService.get<number>('database.port'),
                    username: configService.get<string>('database.username'),
                    password: configService.get<string>('database.password'),
                    database: configService.get<string>('database.database'),
                    entities: [
                        MovieRatingMovieRatingsV1StateTable,
                        MovieRatingMovieRatingsV1Readmodel,
                        ReadmodelProjections,
                    ],
                    synchronize: true,
                    logging: configService.get<string>('database.logging') == 'true',
                    ssl: configService.get<boolean>('database.ssl'),
                    connectTimeoutMS: 30000,
                    poolSize: 10,
                };
                
                return db;
            },
        }),
        TypeOrmModule.forFeature([
            MovieRatingMovieRatingsV1StateTable,
            MovieRatingMovieRatingsV1Readmodel,
            ReadmodelProjections,
        ]),
        ClientsModule.registerAsync([
            {
              name: AUTH_SERVICE,
              useFactory: (configService: ConfigService) => ({
                transport: Transport.TCP,
                options: {
                    host: configService.get('auth.host'),
                    port: configService.get('auth.port'),
                },
              }),
              inject: [ConfigService],
            },
        ]),
        CqrsBoilerplateModule,
        EventSourcingBoilerplateModule,
        EventStoreModule,
        MessageBrokerModule,
    ],
    controllers: [
        HealthController,

        // API - Movie Ratings
        CreateMovieRatingV1Action,
        GetMovieRatingV1Action,
        GetMovieRatingsV1Action,

        // Projectors
        PopulateMovieRatingMovieRatingsProjector,
    ],
    providers: [
        // Aggregate Repositories
        MovieRatingV1WriteRepository,
        { provide: CreateMovieRatingRepositoryInterface, useClass: MovieRatingV1WriteRepository },

        // Readmodel Repositories
        MovieRatingV1ReadmodelWriteRepository,
        MovieRatingV1ReadmodelReadRepository,
        { provide: GetMovieRatingDocumentRepositoryInterface, useClass: MovieRatingV1ReadmodelReadRepository },
        { provide: GetMovieRatingsDocumentRepositoryInterface, useClass: MovieRatingV1ReadmodelReadRepository },
        
        // Command Handlers
        CreateMovieRatingCommandHandler,

        // Query Handlers
        GetMovieRatingQueryHandler,
        GetMovieRatingsQueryHandler,
    ],
})
export class MovieRatingModule {}
