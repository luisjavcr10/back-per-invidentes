import { DataSource, DataSourceOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../modules/usuarios/entities/user.entity';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Configuración de seed para crear datos iniciales en la base de datos
 */
export class SeedConfig {
  private dataSource: DataSource;

  constructor() {
    const seedConfig: DataSourceOptions = {
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/per_invidentes_db',
      entities: [User],
      synchronize: false,
      ssl: { rejectUnauthorized: false }
    };
    
    this.dataSource = new DataSource(seedConfig);
  }

  /**
   * Inicializa la conexión a la base de datos
   */
  async initialize(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }

  /**
   * Cierra la conexión a la base de datos
   */
  async destroy(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  /**
   * Crea un usuario administrador por defecto
   */
  async createAdminUser(): Promise<void> {
    try {
      await this.initialize();
      
      const userRepository = this.dataSource.getRepository(User);
      
      // Verificar si ya existe un admin
      const existingAdmin = await userRepository.findOne({
        where: { email: 'admin@perinvidentes.com' }
      });
      
      if (existingAdmin) {
        console.log('✅ Usuario administrador ya existe');
        return;
      }
      
      // Crear usuario administrador
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      
      const adminUser = userRepository.create({
        name: 'Administrador del Sistema',
        email: 'admin@perinvidentes.com',
        password: hashedPassword,
        phone: '+56912345678',
        isActive: true
      });
      
      await userRepository.save(adminUser);
      
      console.log('🚀 Usuario administrador creado exitosamente:');
      console.log('   Email: admin@perinvidentes.com');
      console.log('   Password: admin123456');
      console.log('   ⚠️  Recuerda cambiar la contraseña después del primer login');
      
    } catch (error) {
      console.error('❌ Error al crear usuario administrador:', error);
      throw error;
    } finally {
      await this.destroy();
    }
  }
  
  /**
   * Ejecuta todos los seeds
   */
  async runSeeds(): Promise<void> {
    console.log('🌱 Iniciando proceso de seed...');
    
    try {
      await this.createAdminUser();
      console.log('✅ Proceso de seed completado exitosamente');
    } catch (error) {
      console.error('❌ Error en el proceso de seed:', error);
      process.exit(1);
    }
  }
}

/**
 * Función para ejecutar el seed desde línea de comandos
 */
export async function runSeed(): Promise<void> {
  const seed = new SeedConfig();
  await seed.runSeeds();
}

// Ejecutar seed si el archivo se ejecuta directamente
if (require.main === module) {
  runSeed();
}