import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Role } from '../modules/usuarios/entities/role.entity';
import { Permission } from '../modules/usuarios/entities/permission.entity';
import { RolePermission } from '../modules/usuarios/entities/role-permission.entity';
import { User } from '../modules/usuarios/entities/user.entity';
import { UserRole } from '../modules/usuarios/entities/user-role.entity';

// Cargar variables de entorno
dotenv.config();

/**
 * Configuración del seed para roles y permisos
 */
const seedConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Role, Permission, UserRole, RolePermission],
  synchronize: true,
  ssl: { rejectUnauthorized: false }
};

/**
 * Clase para manejar el seed de roles y permisos
 */
class RolesPermissionsSeed {
  private dataSource: DataSource;

  /**
   * Inicializa la conexión a la base de datos
   */
  async initialize(): Promise<void> {
    this.dataSource = new DataSource(seedConfig);
    await this.dataSource.initialize();
    console.log('🔗 Conexión a la base de datos establecida para seed de roles y permisos');
  }

  /**
   * Cierra la conexión a la base de datos
   */
  async destroy(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log('🔌 Conexión a la base de datos cerrada');
    }
  }

  /**
   * Crea los permisos básicos del sistema
   */
  async createPermissions(): Promise<Permission[]> {
    const permissionRepository = this.dataSource.getRepository(Permission);
    
    const permissionsData = [
      // Permisos de usuarios
      { name: 'create_user', description: 'Crear usuarios', resource: 'users', action: 'create' },
      { name: 'read_user', description: 'Leer información de usuarios', resource: 'users', action: 'read' },
      { name: 'update_user', description: 'Actualizar usuarios', resource: 'users', action: 'update' },
      { name: 'delete_user', description: 'Eliminar usuarios', resource: 'users', action: 'delete' },
      
      // Permisos de roles
      { name: 'create_role', description: 'Crear roles', resource: 'roles', action: 'create' },
      { name: 'read_role', description: 'Leer información de roles', resource: 'roles', action: 'read' },
      { name: 'update_role', description: 'Actualizar roles', resource: 'roles', action: 'update' },
      { name: 'delete_role', description: 'Eliminar roles', resource: 'roles', action: 'delete' },
      
      // Permisos de permisos
      { name: 'create_permission', description: 'Crear permisos', resource: 'permissions', action: 'create' },
      { name: 'read_permission', description: 'Leer información de permisos', resource: 'permissions', action: 'read' },
      { name: 'update_permission', description: 'Actualizar permisos', resource: 'permissions', action: 'update' },
      { name: 'delete_permission', description: 'Eliminar permisos', resource: 'permissions', action: 'delete' },
      
      // Permisos del perfil propio
      { name: 'read_own_profile', description: 'Leer su propio perfil', resource: 'profile', action: 'read' },
      { name: 'update_own_profile', description: 'Actualizar su propio perfil', resource: 'profile', action: 'update' },
    ];

    const createdPermissions: Permission[] = [];

    for (const permissionData of permissionsData) {
      const existingPermission = await permissionRepository.findOne({
        where: { name: permissionData.name }
      });

      if (!existingPermission) {
        const permission = permissionRepository.create(permissionData);
        const savedPermission = await permissionRepository.save(permission);
        createdPermissions.push(savedPermission);
        console.log(`✅ Permiso creado: ${permissionData.name}`);
      } else {
        createdPermissions.push(existingPermission);
        console.log(`ℹ️  Permiso ya existe: ${permissionData.name}`);
      }
    }

    return createdPermissions;
  }

  /**
   * Crea los roles iniciales del sistema
   */
  async createRoles(): Promise<Role[]> {
    const roleRepository = this.dataSource.getRepository(Role);
    
    const rolesData = [
      {
        name: 'administrador',
        description: 'Administrador del sistema con acceso completo a todas las funcionalidades'
      },
      {
        name: 'usuario',
        description: 'Usuario estándar con permisos básicos para gestionar su propio perfil'
      }
    ];

    const createdRoles: Role[] = [];

    for (const roleData of rolesData) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name }
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        const savedRole = await roleRepository.save(role);
        createdRoles.push(savedRole);
        console.log(`✅ Rol creado: ${roleData.name}`);
      } else {
        createdRoles.push(existingRole);
        console.log(`ℹ️  Rol ya existe: ${roleData.name}`);
      }
    }

    return createdRoles;
  }

  /**
   * Asigna permisos a los roles
   */
  async assignPermissionsToRoles(roles: Role[], permissions: Permission[]): Promise<void> {
    const rolePermissionRepository = this.dataSource.getRepository(RolePermission);
    
    // Buscar roles por nombre
    const adminRole = roles.find(role => role.name === 'administrador');
    const userRole = roles.find(role => role.name === 'usuario');

    if (!adminRole || !userRole) {
      throw new Error('No se encontraron los roles necesarios');
    }

    // Permisos para el administrador (todos los permisos)
    for (const permission of permissions) {
      const existingAssignment = await rolePermissionRepository.findOne({
        where: { roleId: adminRole.id, permissionId: permission.id }
      });

      if (!existingAssignment) {
        const rolePermission = rolePermissionRepository.create({
          roleId: adminRole.id,
          permissionId: permission.id
        });
        await rolePermissionRepository.save(rolePermission);
        console.log(`✅ Permiso ${permission.name} asignado al rol administrador`);
      }
    }

    // Permisos para el usuario (solo permisos de perfil propio)
    const userPermissions = permissions.filter(permission => 
      permission.name === 'read_own_profile' || permission.name === 'update_own_profile'
    );

    for (const permission of userPermissions) {
      const existingAssignment = await rolePermissionRepository.findOne({
        where: { roleId: userRole.id, permissionId: permission.id }
      });

      if (!existingAssignment) {
        const rolePermission = rolePermissionRepository.create({
          roleId: userRole.id,
          permissionId: permission.id
        });
        await rolePermissionRepository.save(rolePermission);
        console.log(`✅ Permiso ${permission.name} asignado al rol usuario`);
      }
    }
  }

  /**
   * Asigna el rol de administrador al usuario admin existente
   */
  async assignAdminRoleToAdminUser(roles: Role[]): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const userRoleRepository = this.dataSource.getRepository(UserRole);
    
    // Buscar el usuario admin
    const adminUser = await userRepository.findOne({
      where: { email: 'admin@perinvidentes.com' }
    });

    if (!adminUser) {
      console.log('⚠️  Usuario administrador no encontrado. Ejecuta primero el seed de usuarios.');
      return;
    }

    // Buscar el rol de administrador
    const adminRole = roles.find(role => role.name === 'administrador');
    if (!adminRole) {
      throw new Error('Rol de administrador no encontrado');
    }

    // Verificar si ya tiene el rol asignado
    const existingUserRole = await userRoleRepository.findOne({
      where: { userId: adminUser.id, roleId: adminRole.id }
    });

    if (!existingUserRole) {
      const userRole = userRoleRepository.create({
        userId: adminUser.id,
        roleId: adminRole.id
      });
      await userRoleRepository.save(userRole);
      console.log(`✅ Rol administrador asignado al usuario ${adminUser.email}`);
    } else {
      console.log(`ℹ️  El usuario ${adminUser.email} ya tiene el rol de administrador`);
    }
  }

  /**
   * Ejecuta todos los seeds de roles y permisos
   */
  async runSeeds(): Promise<void> {
    try {
      console.log('🌱 Iniciando seed de roles y permisos...');
      
      // Crear permisos
      console.log('\n📋 Creando permisos...');
      const permissions = await this.createPermissions();
      
      // Crear roles
      console.log('\n👥 Creando roles...');
      const roles = await this.createRoles();
      
      // Asignar permisos a roles
      console.log('\n🔗 Asignando permisos a roles...');
      await this.assignPermissionsToRoles(roles, permissions);
      
      // Asignar rol de administrador al usuario admin
      console.log('\n👤 Asignando rol de administrador al usuario admin...');
      await this.assignAdminRoleToAdminUser(roles);
      
      console.log('\n🎉 Seed de roles y permisos completado exitosamente');
      console.log('\n📊 Resumen:');
      console.log(`   - Permisos creados/verificados: ${permissions.length}`);
      console.log(`   - Roles creados/verificados: ${roles.length}`);
      console.log('   - Rol administrador: Acceso completo a todas las funcionalidades');
      console.log('   - Rol usuario: Acceso solo a su propio perfil');
      
    } catch (error) {
      console.error('❌ Error durante el seed de roles y permisos:', error);
      throw error;
    }
  }
}

/**
 * Función principal para ejecutar el seed
 */
async function main(): Promise<void> {
  const seed = new RolesPermissionsSeed();
  
  try {
    await seed.initialize();
    await seed.runSeeds();
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await seed.destroy();
  }
}

// Ejecutar el seed si este archivo es ejecutado directamente
if (require.main === module) {
  main();
}

export { RolesPermissionsSeed };