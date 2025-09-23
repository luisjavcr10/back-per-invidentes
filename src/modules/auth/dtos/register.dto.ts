import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para el registro de nuevos usuarios
 */
export class RegisterDto {
  /**
   * Nombre completo del usuario
   */
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez García'
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  /**
   * Correo electrónico del usuario
   */
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@ejemplo.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  /**
   * Número de teléfono del usuario
   */
  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '+56912345678',
    required: false
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  /**
   * Contraseña del usuario (mínimo 6 caracteres)
   */
  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'miPassword123',
    minLength: 6
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}