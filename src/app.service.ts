import { Injectable } from '@nestjs/common';

/**
 * Servicio principal de la aplicación
 * Contiene la lógica de negocio básica
 */
@Injectable()
export class AppService {
  /**
   * Retorna un mensaje de bienvenida
   * @returns Mensaje de bienvenida para la API
   */
  getHello(): string {
    return '¡Bienvenido a la API para personas invidentes!';
  }

  /**
   * Retorna el estado de salud de la aplicación
   * @returns Objeto con información del estado de la aplicación
   */
  getHealth(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'back-per-invidentes',
      version: '1.0.0',
      description: 'API funcionando correctamente'
    };
  }
}