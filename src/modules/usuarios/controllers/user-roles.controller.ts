import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserRolesService } from '../services/user-roles.service';
import { AssignRoleDto, RemoveRoleDto, UserRoleResponseDto } from '../dtos/assign-role.dto';

/**
 * Controlador para gestión de asignación de roles a usuarios
 */
@ApiTags('Asignación de Roles')
@ApiBearerAuth()
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  /**
   * Asignar roles a un usuario
   */
  @Post('assign')
  @ApiOperation({
    summary: 'Asignar roles a un usuario',
    description: 'Asigna uno o más roles a un usuario específico. Los roles deben estar activos.',
  })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles asignados exitosamente',
    type: UserRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado o roles no encontrados/inactivos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Todos los roles ya están asignados al usuario',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async assignRoles(@Body() assignRoleDto: AssignRoleDto): Promise<UserRoleResponseDto> {
    return this.userRolesService.assignRoles(assignRoleDto);
  }

  /**
   * Remover roles de un usuario
   */
  @Delete('remove')
  @ApiOperation({
    summary: 'Remover roles de un usuario',
    description: 'Remueve uno o más roles de un usuario específico.',
  })
  @ApiBody({ type: RemoveRoleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles removidos exitosamente',
    type: UserRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado o roles no asignados al usuario',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async removeRoles(@Body() removeRoleDto: RemoveRoleDto): Promise<UserRoleResponseDto> {
    return this.userRolesService.removeRoles(removeRoleDto);
  }

  /**
   * Obtener todos los roles de un usuario
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener roles de un usuario',
    description: 'Obtiene todos los roles asignados a un usuario específico.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles del usuario obtenidos exitosamente',
    type: UserRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de usuario inválido',
  })
  async getUserRoles(@Param('userId', ParseUUIDPipe) userId: string): Promise<UserRoleResponseDto> {
    return this.userRolesService.getUserRoles(userId);
  }

  /**
   * Obtener usuarios por rol
   */
  @Get('role/:roleId/users')
  @ApiOperation({
    summary: 'Obtener usuarios por rol',
    description: 'Obtiene todos los usuarios que tienen asignado un rol específico.',
  })
  @ApiParam({
    name: 'roleId',
    type: String,
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuarios con el rol obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
            name: { type: 'string', example: 'Administrador' },
            description: { type: 'string', example: 'Rol con permisos administrativos' },
          },
        },
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
              name: { type: 'string', example: 'Juan Pérez' },
              email: { type: 'string', example: 'juan.perez@example.com' },
              assignedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de rol inválido',
  })
  async getUsersByRole(@Param('roleId', ParseUUIDPipe) roleId: string): Promise<{
    role: { id: string; name: string; description: string };
    users: { id: string; name: string; email: string; assignedAt: Date }[];
  }> {
    return this.userRolesService.getUsersByRole(roleId);
  }

  /**
   * Reemplazar todos los roles de un usuario
   */
  @Put('user/:userId/roles')
  @ApiOperation({
    summary: 'Reemplazar roles de un usuario',
    description: 'Reemplaza todos los roles actuales de un usuario con una nueva lista de roles.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array de IDs de roles para asignar al usuario',
          example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
        },
      },
      required: ['roleIds'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles del usuario reemplazados exitosamente',
    type: UserRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado o roles no encontrados/inactivos',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async replaceUserRoles(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('roleIds') roleIds: string[],
  ): Promise<UserRoleResponseDto> {
    return this.userRolesService.replaceUserRoles(userId, roleIds);
  }
}