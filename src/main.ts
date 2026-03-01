import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // 🔥 ใช้ absolute path ไป root/uploads
  const uploadPath = join(process.cwd(), "uploads");
  console.log("Serving uploads from:", uploadPath);

  app.useStaticAssets(uploadPath, {
    prefix: "/uploads",
  });

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  await app.listen(3001);
  console.log("API running at http://localhost:3001");
}

bootstrap();