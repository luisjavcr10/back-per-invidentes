import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

// Cargar variables de entorno
dotenv.config();

/**
 * Función principal que inicializa la aplicación NestJS
 * Configura el servidor en el puerto 3000 por defecto
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Configurar Swagger para documentación de la API
  setupSwagger(app);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
}

bootstrap();