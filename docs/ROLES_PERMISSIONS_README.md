# 🔐 Sistema de Roles y Permisos

## Descripción

Este sistema implementa un control de acceso basado en roles (RBAC - Role-Based Access Control) que permite gestionar de forma granular los permisos de los usuarios en la aplicación.

## 🏗️ Arquitectura del Sistema

### Entidades Principales

#### 1. **User** (Usuario)
- Entidad principal que representa a los usuarios del sistema
- Puede tener múltiples roles a través de la tabla intermedia `UserRole`

#### 2. **Role** (Rol)
- Define los diferentes tipos de usuarios en el sistema
- Puede tener múltiples permisos a través de la tabla intermedia `RolePermission`

#### 3. **Permission** (Permiso)
- Define acciones específicas que se pueden realizar en el sistema
- Se estructura con `resource` (recurso) y `action` (acción)

#### 4. **UserRole** (Tabla Intermedia Usuario-Rol)
- Permite que un usuario tenga múltiples roles
- Incluye campos de auditoría como `assignedAt` e `isActive`

#### 5. **RolePermission** (Tabla Intermedia Rol-Permiso)
- Permite que un rol tenga múltiples permisos
- Incluye campos de auditoría como `assignedAt` e `isActive`

## 📊 Estructura de la Base de Datos

```
users (usuarios)
├── id (UUID, PK)
├── name (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── password (VARCHAR)
├── phone (VARCHAR)
├── isActive (BOOLEAN)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

roles (roles)
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE)
├── description (TEXT)
├── isActive (BOOLEAN)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

permissions (permisos)
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE)
├── description (TEXT)
├── resource (VARCHAR)
├── action (VARCHAR)
├── isActive (BOOLEAN)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

user_roles (usuario-roles)
├── id (UUID, PK)
├── userId (UUID, FK)
├── roleId (UUID, FK)
├── isActive (BOOLEAN)
└── assignedAt (TIMESTAMP)

role_permissions (rol-permisos)
├── id (UUID, PK)
├── roleId (UUID, FK)
├── permissionId (UUID, FK)
├── isActive (BOOLEAN)
└── assignedAt (TIMESTAMP)
```

## 🎭 Roles Predefinidos

### 1. **Administrador**
- **Nombre**: `administrador`
- **Descripción**: Administrador del sistema con acceso completo a todas las funcionalidades
- **Permisos**: Todos los permisos del sistema

### 2. **Usuario**
- **Nombre**: `usuario`
- **Descripción**: Usuario estándar con permisos básicos para gestionar su propio perfil
- **Permisos**: Solo permisos de perfil propio

## 🔑 Permisos del Sistema

### Permisos de Usuarios
- `create_user` - Crear usuarios
- `read_user` - Leer información de usuarios
- `update_user` - Actualizar usuarios
- `delete_user` - Eliminar usuarios

### Permisos de Roles
- `create_role` - Crear roles
- `read_role` - Leer información de roles
- `update_role` - Actualizar roles
- `delete_role` - Eliminar roles

### Permisos de Permisos
- `create_permission` - Crear permisos
- `read_permission` - Leer información de permisos
- `update_permission` - Actualizar permisos
- `delete_permission` - Eliminar permisos

### Permisos de Perfil Propio
- `read_own_profile` - Leer su propio perfil
- `update_own_profile` - Actualizar su propio perfil

## 🚀 Uso del Sistema

### 1. Ejecutar el Seed
```bash
# Crear roles y permisos iniciales
npm run seed:roles
```

### 2. Verificar la Creación
El seed creará automáticamente:
- ✅ 14 permisos básicos del sistema
- ✅ 2 roles (administrador y usuario)
- ✅ Asignación de permisos a roles
- ✅ Asignación del rol administrador al usuario admin

### 3. Usuario Administrador
El usuario administrador creado previamente (`admin@perinvidentes.com`) ahora tiene:
- **Rol**: Administrador
- **Permisos**: Acceso completo a todas las funcionalidades

## 🔧 Implementación en el Código

### Relaciones en las Entidades

#### User Entity
```typescript
@OneToMany(() => UserRole, userRole => userRole.user)
userRoles: UserRole[];
```

#### Role Entity
```typescript
@OneToMany(() => UserRole, userRole => userRole.role)
userRoles: UserRole[];

@OneToMany(() => RolePermission, rolePermission => rolePermission.role)
rolePermissions: RolePermission[];
```

#### Permission Entity
```typescript
@OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
rolePermissions: RolePermission[];
```

### Consultas Útiles

#### Obtener roles de un usuario
```typescript
const userWithRoles = await userRepository.findOne({
  where: { id: userId },
  relations: ['userRoles', 'userRoles.role']
});
```

#### Obtener permisos de un rol
```typescript
const roleWithPermissions = await roleRepository.findOne({
  where: { id: roleId },
  relations: ['rolePermissions', 'rolePermissions.permission']
});
```

#### Verificar si un usuario tiene un permiso específico
```typescript
const hasPermission = await userRoleRepository
  .createQueryBuilder('ur')
  .innerJoin('ur.role', 'r')
  .innerJoin('r.rolePermissions', 'rp')
  .innerJoin('rp.permission', 'p')
  .where('ur.userId = :userId', { userId })
  .andWhere('p.name = :permissionName', { permissionName })
  .andWhere('ur.isActive = true')
  .andWhere('rp.isActive = true')
  .getOne();
```

## 🛡️ Seguridad y Mejores Prácticas

### 1. Principio de Menor Privilegio
- Los usuarios solo tienen los permisos mínimos necesarios
- El rol "usuario" solo puede gestionar su propio perfil

### 2. Auditoría
- Todas las asignaciones incluyen timestamps (`assignedAt`)
- Campos `isActive` permiten desactivar sin eliminar

### 3. Flexibilidad
- Sistema escalable para agregar nuevos roles y permisos
- Relaciones many-to-many permiten asignaciones complejas

### 4. Integridad de Datos
- Claves foráneas con `CASCADE` para mantener consistencia
- Campos únicos para evitar duplicados

## 📈 Extensibilidad

### Agregar Nuevos Roles
1. Crear el rol en la base de datos
2. Asignar permisos específicos
3. Documentar el propósito del rol

### Agregar Nuevos Permisos
1. Definir el recurso y acción
2. Crear el permiso en la base de datos
3. Asignar a los roles correspondientes

### Implementar Middleware de Autorización
```typescript
// Ejemplo de guard para verificar permisos
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Lógica para verificar permisos del usuario
    return true;
  }
}
```

## 🔍 Troubleshooting

### Error: Tablas no existen
- Asegúrate de que `synchronize: true` esté habilitado en la configuración
- Reinicia el servidor para que TypeORM cree las tablas

### Error: Usuario admin no encontrado
- Ejecuta primero el seed de usuarios: `npm run seed`
- Luego ejecuta el seed de roles: `npm run seed:roles`

### Error: Permisos duplicados
- El sistema previene duplicados automáticamente
- Los mensajes "ya existe" son normales en ejecuciones posteriores

## 📚 Próximos Pasos

1. **Implementar Guards**: Crear guards de NestJS para verificar permisos
2. **Decoradores Personalizados**: Crear decoradores para simplificar la verificación de permisos
3. **API de Gestión**: Crear endpoints para gestionar roles y permisos dinámicamente
4. **Interfaz de Usuario**: Desarrollar una interfaz para administrar el sistema de permisos
5. **Logs de Auditoría**: Implementar logging de cambios en roles y permisos

---

**¡El sistema de roles y permisos está listo para usar!** 🎉