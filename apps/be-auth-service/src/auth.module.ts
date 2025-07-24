import { Logger, Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CqrsBoilerplateModule, EventSourcingBoilerplateModule, EventStoreModule, MessageBrokerModule, ReadmodelProjections } from '@backend-monorepo/boilerplate';
import { AuthAccountsV1StateTable } from './infrastructure/schemas/aggregate-state-tables/auth-accounts-v1-state.table';
import { AuthUsersV1Readmodel } from './infrastructure/schemas/readmodels/auth-users-v1.readmodel';
import { PopulateAuthUsersProjector } from './infrastructure/inbound/projectors/populate-auth-users.projector';
import { AuthUsersV1ReadmodelWriteRepository } from './infrastructure/outbound/repository/v1/write/auth-users-readmodel-write.repository';
import { AccountV1WriteRepository } from './infrastructure/outbound/repository/v1/write/account-write.repository';
import { SignUpV1Action } from './infrastructure/inbound/api/v1/accounts/sign-up/sign-up.action';
import { SignUpCommandHandler } from './application/use-cases/sign-up/sign-up.command-handler';
import { AccountRepositoryInterface as SignUpRepositoryInterface } from './application/use-cases/sign-up/account.repository.interface';
import { UsersReadmodelReadRepositoryInterface as GetSignUpReadmodelRepositoryInterface } from './application/use-cases/sign-up/users-readmodel-read.repository.interface';
import { AuthUsersV1ReadmodelReadRepository } from './infrastructure/outbound/repository/v1/read/auth-users-readmodel-read.repository';

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
                  AuthAccountsV1StateTable,
                  AuthUsersV1Readmodel,
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
        AuthAccountsV1StateTable,
        AuthUsersV1Readmodel,
        ReadmodelProjections,
    ]),
    CqrsBoilerplateModule,
    EventSourcingBoilerplateModule,
    EventStoreModule,
    MessageBrokerModule,
  ],
  controllers: [
    AppController,

    // API - Accounts
    SignUpV1Action,

    // Projectors
    PopulateAuthUsersProjector,
  ],
  providers: [
    // Readmodel repositories
    AuthUsersV1ReadmodelWriteRepository,
    AuthUsersV1ReadmodelReadRepository,
    { provide: GetSignUpReadmodelRepositoryInterface, useExisting: AuthUsersV1ReadmodelReadRepository },

    // Write repositories
    AccountV1WriteRepository,
    { provide: SignUpRepositoryInterface, useExisting: AccountV1WriteRepository },

    // Command Handlers
    SignUpCommandHandler,

  ],
})
export class AuthModule {}
