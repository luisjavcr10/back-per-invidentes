import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO de respuesta para permisos
 */
export class PermissionResponseDto {
  @ApiProperty({
    description: 'ID único del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nombre del permiso',
    example: 'crear_usuarios',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Descripción del permiso',
    example: 'Permite crear nuevos usuarios en el sistema',
    nullable: true,
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    description: 'Recurso al que aplica el permiso',
    example: 'usuarios',
  })
  @Expose()
  resource: string;

  @ApiProperty({
    description: 'Acción que permite el permiso',
    example: 'crear',
  })
  @Expose()
  action: string;

  @ApiProperty({
    description: 'Estado activo del permiso',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación del permiso',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del permiso',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({
    description: 'Número de roles que tienen este permiso',
    example: 3,
    required: false,
  })
  @Expose()
  roleCount?: number;
}