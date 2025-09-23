import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * Controlador principal de la aplicación
 * Maneja las rutas básicas de la API
 */
@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint de bienvenida
   * @returns Mensaje de bienvenida de la API
   */
  @Get()
  @Redirect('/api/docs', 302)
  getHello(): void {
    // Redirección automática a la documentación de Swagger
  }

  /**
   * Endpoint de estado de la API
   * @returns Estado actual de la aplicación
   */
  @ApiOperation({ summary: 'Estado de la API', description: 'Verifica el estado de salud de la aplicación' })
  @ApiResponse({ status: 200, description: 'API funcionando correctamente' })
  @Get('health')
  getHealth(): object {
    return this.appService.getHealth();
  }
}