import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar un rol existente
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({
    description: 'Estado activo del rol',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}