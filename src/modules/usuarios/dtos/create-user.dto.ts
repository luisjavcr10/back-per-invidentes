import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUserDto {
  /**
   * Nombre completo del usuario
   */
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'María González López'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Correo electrónico del usuario
   */
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'maria.gonzalez@ejemplo.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  /**
   * Número de teléfono del usuario
   */
  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '+56987654321',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  /**
   * Contraseña del usuario
   */
  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123'
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  /**
   * Estado activo del usuario
   */
  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * IDs de roles a asignar al usuario
   */
  @ApiProperty({
    description: 'Array de IDs de roles a asignar al usuario (opcional, si no se proporciona se asigna rol "usuario" por defecto)',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de rol debe ser un UUID válido' })
  roleIds?: string[];
}