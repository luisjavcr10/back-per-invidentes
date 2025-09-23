import { IsEmail, IsNotEmpty, IsOptional, IsString, IsPhoneNumber } from 'class-validator';
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
  nombre: string;

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
  telefono?: string;

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
}