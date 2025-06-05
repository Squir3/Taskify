import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/public', express.static(join(__dirname, '..', 'public')));

  // Enable CORS for frontend communication
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Taskify API')
    .setDescription('API for managing tasks and projects')
    .setVersion('1.0')
    .addTag('tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    //customCssUrl: '/public/swagger-dark.css', // Dodanie niestandardowego CSS
  });

  await app.listen(3000);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
});
