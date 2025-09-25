import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';

/**
 * DTO para asignar permisos a un rol
 */
export class AssignPermissionDto {
  @ApiProperty({
    description: 'ID del rol al que se asignarán los permisos',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID del rol debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  roleId: string;

  @ApiProperty({
    description: 'Array de IDs de permisos a asignar al rol',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String],
  })
  @IsArray({ message: 'Los permisos deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un permiso' })
  @IsUUID('4', { each: true, message: 'Cada ID de permiso debe ser un UUID válido' })
  permissionIds: string[];
}

/**
 * DTO para remover permisos de un rol
 */
export class RemovePermissionDto {
  @ApiProperty({
    description: 'ID del rol del que se removerán los permisos',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID del rol debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  roleId: string;

  @ApiProperty({
    description: 'Array de IDs de permisos a remover del rol',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray({ message: 'Los permisos deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un permiso' })
  @IsUUID('4', { each: true, message: 'Cada ID de permiso debe ser un UUID válido' })
  permissionIds: string[];
}

/**
 * DTO de respuesta para operaciones de asignación de permisos
 */
export class RolePermissionResponseDto {
  @ApiProperty({
    description: 'ID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  roleId: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'Administrador',
  })
  roleName: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Rol con permisos administrativos',
  })
  roleDescription: string;

  @ApiProperty({
    description: 'Estado activo del rol',
    example: true,
  })
  roleIsActive: boolean;

  @ApiProperty({
    description: 'Lista de permisos asignados al rol',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
        name: { type: 'string', example: 'users:read' },
        description: { type: 'string', example: 'Leer información de usuarios' },
        resource: { type: 'string', example: 'users' },
        action: { type: 'string', example: 'read' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  permissions: {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
    isActive: boolean;
  }[];

  @ApiProperty({
    description: 'Fecha de la última actualización de permisos',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

/**
 * DTO de respuesta para obtener roles por permiso
 */
export class PermissionRoleResponseDto {
  @ApiProperty({
    description: 'Información del permiso',
    type: 'object',
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
      name: { type: 'string', example: 'users:read' },
      description: { type: 'string', example: 'Leer información de usuarios' },
      resource: { type: 'string', example: 'users' },
      action: { type: 'string', example: 'read' },
    },
  })
  permission: {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
  };

  @ApiProperty({
    description: 'Lista de roles que tienen este permiso',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'Administrador' },
        description: { type: 'string', example: 'Rol con permisos administrativos' },
        assignedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
      },
    },
  })
  roles: {
    id: string;
    name: string;
    description: string;
    assignedAt: Date;
  }[];
}