/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MovieRatingModule } from './movie-rating.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from '@backend-monorepo/boilerplate';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(MovieRatingModule);

    const configService = app.get(ConfigService);
    
    const config = new DocumentBuilder()
      .setTitle('Movie Rating Service API')
      .setDescription('API documentation for the Movie Rating Service - Create, manage, and discover movie ratings')
      .setVersion('1.0')
      .addTag('health', 'Service health and monitoring endpoints')
      .addTag('movie-ratings', 'Movie rating management endpoints')
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
          groupId: 'movie-rating-service-consumer',
        },
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
    const port = configService.get<number>('app.port') || 3001;
    await app.listen(port, host);
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
    Logger.log(
      `📚 Swagger documentation available at: http://localhost:${port}/${globalPrefix}/docs`
    );
}

bootstrap();
