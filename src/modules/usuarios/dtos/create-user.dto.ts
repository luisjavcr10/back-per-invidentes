import { IsEmail, IsNotEmpty, IsOptional, IsString, IsPhoneNumber } from 'class-validator';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUserDto {
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
   * Contraseña del usuario
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}