import { Logger, Module } from '@nestjs/common';
import { HealthController } from './infrastructure/inbound/api/v1/health/health.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CqrsBoilerplateModule, EventSourcingBoilerplateModule, EventStoreModule, MessageBrokerModule, ReadmodelProjections } from '@backend-monorepo/boilerplate';
import { AuthAccountsV1StateTable } from './infrastructure/schemas/aggregate-state-tables/auth-accounts-v1-state.table';
import { AuthUsersV1Readmodel } from './infrastructure/schemas/readmodels/auth-users-v1.readmodel';
import { PopulateAuthUsersProjector } from './infrastructure/inbound/projectors/v1/populate-auth-users.projector';
import { AuthUsersV1ReadmodelWriteRepository } from './infrastructure/outbound/repository/v1/write/auth-users-readmodel-write.repository';
import { AccountV1WriteRepository } from './infrastructure/outbound/repository/v1/write/account-write.repository';
import { SignUpV1Action } from './infrastructure/inbound/api/v1/accounts/sign-up/sign-up.action';
import { SignUpCommandHandler } from './application/use-cases/sign-up/sign-up.command-handler';
import { AccountRepositoryInterface as SignUpRepositoryInterface } from './application/use-cases/sign-up/account.repository.interface';
import { GetUsersDocumentRepositoryInterface as GetSignUpReadmodelRepositoryInterface } from './application/use-cases/sign-up/get-users-document.repository.interface';
import { AuthUsersV1ReadmodelReadRepository } from './infrastructure/outbound/repository/v1/read/auth-users-readmodel-read.repository';
import { AccountV1ReadRepository } from './infrastructure/outbound/repository/v1/read/account-read.repository';
import { AccountReadRepositoryInterface as GetUpdateUsernameRepositoryInterface } from './application/use-cases/update-username/account-read.repository.interface';
import { UpdateUsernameCommandHandler } from './application/use-cases/update-username/update-username.command-handler';
import { LocalStrategy } from './infrastructure/util/strategies/local.strategy';
import { LoginV1Action } from './infrastructure/inbound/api/v1/auth/login.action';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infrastructure/util/strategies/jwt.strategy';
import { UpdateUsernameV1Action } from './infrastructure/inbound/api/v1/accounts/update-username/update-username.action';
import { AccountRepositoryInterface as UpdateUsernameRepositoryInterface } from './application/use-cases/update-username/account.repository.interface';
import { ValidateV1Action } from './infrastructure/inbound/api/v1/auth/validate.action';
import { AuthenticateV1Action } from './infrastructure/inbound/tcp/v1/authenticate.action';
import { GetAccountV1Action } from './infrastructure/inbound/api/v1/accounts/get-account/get-account.action';
import { GetAccountQueryHandler } from './application/use-cases/get-account/get-account.query-handler';
import { GetAccountDocumentRepositoryInterface } from './application/use-cases/get-account/get-account-document.repository.interface';

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
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: `${configService.get<string>('jwt.expiration')}s`,
        },
      }),
    }),
    CqrsBoilerplateModule,
    EventSourcingBoilerplateModule,
    EventStoreModule,
    MessageBrokerModule,
  ],
  controllers: [
    HealthController,

    // API - Accounts
    SignUpV1Action,
    UpdateUsernameV1Action,
    GetAccountV1Action,

    // API - Auth
    LoginV1Action,
    ValidateV1Action,

    // TCP - Auth
    AuthenticateV1Action,

    // Projectors
    PopulateAuthUsersProjector,
  ],
  providers: [
    // Readmodel repositories
    AuthUsersV1ReadmodelWriteRepository,
    AuthUsersV1ReadmodelReadRepository,
    { provide: GetSignUpReadmodelRepositoryInterface, useExisting: AuthUsersV1ReadmodelReadRepository },
    { provide: GetAccountDocumentRepositoryInterface, useExisting: AuthUsersV1ReadmodelReadRepository },

    // Aggregate repositories
    AccountV1WriteRepository,
    { provide: SignUpRepositoryInterface, useExisting: AccountV1WriteRepository },
    { provide: UpdateUsernameRepositoryInterface, useExisting: AccountV1WriteRepository },

    AccountV1ReadRepository,
    { provide: GetUpdateUsernameRepositoryInterface, useExisting: AccountV1ReadRepository },

    // Command Handlers
    SignUpCommandHandler,
    UpdateUsernameCommandHandler,

    // Query Handlers
    GetAccountQueryHandler,

    // Strategies
    JwtStrategy,
    LocalStrategy,
  ],
})
export class AuthModule {}
