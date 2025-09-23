import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Configuración de Swagger para la documentación de la API
 * @param app Instancia de la aplicación NestJS
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('API Personas Invidentes')
    .setDescription('Documentación de la API del sistema para personas invidentes')
    .setVersion('1.0')
    .addBearerAuth() // Para autenticación JWT
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('users', 'Endpoints de gestión de usuarios')
    .addTag('health', 'Endpoints de estado de la aplicación')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}