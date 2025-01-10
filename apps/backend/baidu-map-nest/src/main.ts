/**
 * @description 入口文件
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
// import { LoggerMiddleware } from './middlewares/LoggerMiddleware';
import { HttpErrorFilter } from './common/filters/ExceptionFilter';
// import { CodeErrorFilter } from './common/filters/CodeErrorFilter';
// import { DetailPipe } from './common/pipes/DetailPipe';
import { AuthGuard } from './common/guards/Auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalInterceptors(new LoggerMiddleware());

  // app.useGlobalFilters;
  app.useGlobalFilters(new HttpErrorFilter(), /* new CodeErrorFilter() */);

  // app.useGlobalPipes
  // app.useGlobalPipes(new DetailPipe());

  // app.useGlobalGuards
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthGuard(reflector));

  // 启用 CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 允许携带 cookie
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
