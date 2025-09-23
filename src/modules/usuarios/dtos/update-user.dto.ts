import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar un usuario existente
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  /**
   * Estado activo del usuario
   */
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}