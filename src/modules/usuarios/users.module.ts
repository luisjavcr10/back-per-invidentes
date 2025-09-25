import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { UserRolesService } from './services/user-roles.service';
import { RolePermissionsService } from './services/role-permissions.service';
import { UsersController } from './controllers/users.controller';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { UserRolesController } from './controllers/user-roles.controller';
import { RolePermissionsController } from './controllers/role-permissions.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';

/**
 * Módulo de usuarios que maneja las operaciones CRUD de usuarios, roles, permisos y sus relaciones
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, UserRole, RolePermission])],
  controllers: [
    UsersController,
    RolesController,
    PermissionsController,
    UserRolesController,
    RolePermissionsController,
  ],
  providers: [
    UsersService,
    RolesService,
    PermissionsService,
    UserRolesService,
    RolePermissionsService,
  ],
  exports: [
    UsersService,
    RolesService,
    PermissionsService,
    UserRolesService,
    RolePermissionsService,
  ],
})
export class UsersModule {}