import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Configuración de la base de datos PostgreSQL
 * @returns Configuración de TypeORM para la conexión a la base de datos
 */
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL ,
  autoLoadEntities: true,
  synchronize: true,
  //dropSchema: true,
  ssl: { rejectUnauthorized: false },
};