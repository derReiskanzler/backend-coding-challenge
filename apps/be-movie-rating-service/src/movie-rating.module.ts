import { Logger, Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { CqrsBoilerplateModule, EventSourcingBoilerplateModule, EventStoreModule, MessageBrokerModule } from '@backend-monorepo/boilerplate';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

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
        ]),
        CqrsBoilerplateModule,
        EventSourcingBoilerplateModule,
        EventStoreModule,
        MessageBrokerModule,
    ],
    controllers: [
        AppController,
    ],
    providers: [

    ],
})
export class MovieRatingModule {}
