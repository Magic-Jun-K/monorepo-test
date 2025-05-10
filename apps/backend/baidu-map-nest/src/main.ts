/**
 * @description 入口文件
 */
import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';
// import { LoggerMiddleware } from './middlewares/LoggerMiddleware';
import { HttpErrorFilter } from './common/filters/exception.filter';
// import { DetailPipe } from './common/pipes/DetailPipe';
import { AuthGuard } from './common/guards/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalInterceptors(new LoggerMiddleware());

  app.useGlobalFilters(new HttpErrorFilter());

  // app.useGlobalPipes(new DetailPipe());

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthGuard(reflector));

  // 启用 CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    methods: 'GET,POST,HEAD,PUT,PATCH,DELETE',
    credentials: true, // 允许携带 cookie
  });
  console.log('process.env.PORT', process.env.PORT);

  await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
