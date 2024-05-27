import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { version } from '../package.json';
import { AppModule } from './app.module';

const logger = new Logger('App');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            validationError: {
                target: false,
                value: false,
            },
        }),
    );

    app.enableCors({
        origin: 'http://localhost:5173', // Replace with your client application's URL
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept',
        credentials: true, // Allows cookies to be sent with requests
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    app.enableVersioning();

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Uni Messanger API')
        .setVersion(version)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);

    await app.listen(configService.get('APP_PORT') || 3000);
    logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
