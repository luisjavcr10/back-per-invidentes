import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para el login de usuarios
 */
export class LoginDto {
  /**
   * Correo electrónico del usuario
   */
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'admin@perinvidentes.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  /**
   * Contraseña del usuario
   */
  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'admin123456',
    minLength: 1
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}