import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';

/**
 * DTO para asignar roles a un usuario
 */
export class AssignRoleDto {
  @ApiProperty({
    description: 'ID del usuario al que se asignarán los roles',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'Array de IDs de roles a asignar al usuario',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String],
  })
  @IsArray({ message: 'Los roles deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un rol' })
  @IsUUID('4', { each: true, message: 'Cada ID de rol debe ser un UUID válido' })
  roleIds: string[];
}

/**
 * DTO para remover roles de un usuario
 */
export class RemoveRoleDto {
  @ApiProperty({
    description: 'ID del usuario del que se removerán los roles',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'Array de IDs de roles a remover del usuario',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray({ message: 'Los roles deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un rol' })
  @IsUUID('4', { each: true, message: 'Cada ID de rol debe ser un UUID válido' })
  roleIds: string[];
}

/**
 * DTO de respuesta para operaciones de asignación de roles
 */
export class UserRoleResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  userName: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com',
  })
  userEmail: string;

  @ApiProperty({
    description: 'Lista de roles asignados al usuario',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
        name: { type: 'string', example: 'Administrador' },
        description: { type: 'string', example: 'Rol con permisos administrativos' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  roles: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  }[];

  @ApiProperty({
    description: 'Fecha de la última actualización de roles',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}