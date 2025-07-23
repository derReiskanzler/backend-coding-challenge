import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AuthModule {}
