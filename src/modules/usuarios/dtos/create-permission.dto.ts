import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, IsIn } from 'class-validator';

/**
 * DTO para crear un nuevo permiso
 */
export class CreatePermissionDto {
  @ApiProperty({
    description: 'Nombre del permiso',
    example: 'crear_usuarios',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Descripción del permiso',
    example: 'Permite crear nuevos usuarios en el sistema',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    description: 'Recurso al que aplica el permiso',
    example: 'usuarios',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  resource: string;

  @ApiProperty({
    description: 'Acción que permite el permiso',
    example: 'crear',
    enum: ['crear', 'leer', 'actualizar', 'eliminar', 'administrar'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['crear', 'leer', 'actualizar', 'eliminar', 'administrar'])
  action: string;

  @ApiProperty({
    description: 'Estado activo del permiso',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}