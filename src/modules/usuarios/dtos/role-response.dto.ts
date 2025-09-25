import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO de respuesta para roles
 */
export class RoleResponseDto {
  @ApiProperty({
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'administrador',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Rol con acceso completo al sistema',
    nullable: true,
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    description: 'Estado activo del rol',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación del rol',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del rol',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({
    description: 'Número de usuarios asignados a este rol',
    example: 5,
    required: false,
  })
  @Expose()
  userCount?: number;

  @ApiProperty({
    description: 'Número de permisos asignados a este rol',
    example: 12,
    required: false,
  })
  @Expose()
  permissionCount?: number;
}