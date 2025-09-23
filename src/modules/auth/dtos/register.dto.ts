import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO para el registro de nuevos usuarios
 */
export class RegisterDto {
  /**
   * Nombre completo del usuario
   */
  @IsNotEmpty()
  @IsString()
  nombre: string;

  /**
   * Correo electrónico del usuario
   */
  @IsEmail()
  email: string;

  /**
   * Número de teléfono del usuario
   */
  @IsOptional()
  @IsString()
  telefono?: string;

  /**
   * Contraseña del usuario (mínimo 6 caracteres)
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}