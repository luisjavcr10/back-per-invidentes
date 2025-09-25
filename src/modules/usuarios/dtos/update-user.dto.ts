import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO para actualizar un usuario existente
 * Excluye roleIds ya que los roles se manejan por separado
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['roleIds'] as const)
) {}