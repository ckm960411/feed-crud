import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // class-validator 데코레이터가 없는 속성은 무시
      errorHttpStatusCode: 400,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          value: error.value,
          message: Object.values(error.constraints)[0],
        }));

        throw new BadRequestException({
          statusCode: 400,
          message: '잘못된 요청입니다',
          errors: messages,
        });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
