import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controlador principal de la aplicación
 * Maneja las rutas básicas de la API
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint de bienvenida
   * @returns Mensaje de bienvenida de la API
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Endpoint de estado de la API
   * @returns Estado actual de la aplicación
   */
  @Get('health')
  getHealth(): object {
    return this.appService.getHealth();
  }
}