import { Logger, Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
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
import { MovieRatingMovieRatingsV1ReadmodelWriteRepository } from './infrastructure/outbound/repository/v1/write/movie-rating-movie-ratings-readmodel-write.repository';
import { PopulateMovieRatingMovieRatingsProjector } from './infrastructure/inbound/projectors/v1/populate-movie-rating-movie-ratings.projector';

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
        AppController,

        // API - Movie Ratings
        CreateMovieRatingV1Action,

        // Projectors
        PopulateMovieRatingMovieRatingsProjector,
    ],
    providers: [
        // Aggregate Repositories
        MovieRatingV1WriteRepository,
        { provide: CreateMovieRatingRepositoryInterface, useClass: MovieRatingV1WriteRepository },

        // Readmodel Repositories
        MovieRatingMovieRatingsV1ReadmodelWriteRepository,

        // Command Handlers
        CreateMovieRatingCommandHandler,
    ],
})
export class MovieRatingModule {}
