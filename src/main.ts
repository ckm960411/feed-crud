import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['log', 'warn', 'error', 'debug', 'verbose'], // 모든 로그 레벨 활성화
  });
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

  const config = new DocumentBuilder()
    .setTitle('바로고 API')
    .setDescription('멋쟁이 토마토 캠퍼스 바로고 API 문서입니다.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
