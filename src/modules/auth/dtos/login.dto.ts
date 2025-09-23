import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para el login de usuarios
 */
export class LoginDto {
  /**
   * Correo electrónico del usuario
   */
  @IsEmail()
  email: string;

  /**
   * Contraseña del usuario
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}