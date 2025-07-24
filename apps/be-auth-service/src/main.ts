/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '@backend-monorepo/boilerplate';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  
  const config = new DocumentBuilder()
    .setTitle('Authentication Service API')
    .setDescription('API documentation for the Authentication Service')
    .setVersion('1.0')
    .addTag('health', 'Service health and monitoring endpoints')
    .addTag('accounts', 'Account management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [
          `${configService.get<string>('message_broker.host')}:${configService.get<number>('message_broker.port')}`,
          ],
      },
      consumer: {
        groupId: 'auth-service-consumer',
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: configService.get<string>('auth.host'),
      port: configService.get<number>('auth.port'),
    },
  });
  
  app.enableCors({...configService.get('app.cors'), 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter(configService));

  app.startAllMicroservices();

  const host = configService.get<string>('app.host') || '0.0.0.0';
  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port, host);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
}

bootstrap();
