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
import { RolePermissionsService } from '../services/role-permissions.service';
import {
  AssignPermissionDto,
  RemovePermissionDto,
  RolePermissionResponseDto,
  PermissionRoleResponseDto,
} from '../dtos/assign-permission.dto';

/**
 * Controlador para gestión de asignación de permisos a roles
 */
@ApiTags('Asignación de Permisos')
@ApiBearerAuth()
@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  /**
   * Asignar permisos a un rol
   */
  @Post('assign')
  @ApiOperation({
    summary: 'Asignar permisos a un rol',
    description: 'Asigna uno o más permisos a un rol específico. Los permisos deben estar activos.',
  })
  @ApiBody({ type: AssignPermissionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permisos asignados exitosamente',
    type: RolePermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rol no encontrado/inactivo o permisos no encontrados/inactivos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Todos los permisos ya están asignados al rol',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async assignPermissions(@Body() assignPermissionDto: AssignPermissionDto): Promise<RolePermissionResponseDto> {
    return this.rolePermissionsService.assignPermissions(assignPermissionDto);
  }

  /**
   * Remover permisos de un rol
   */
  @Delete('remove')
  @ApiOperation({
    summary: 'Remover permisos de un rol',
    description: 'Remueve uno o más permisos de un rol específico.',
  })
  @ApiBody({ type: RemovePermissionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permisos removidos exitosamente',
    type: RolePermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rol no encontrado o permisos no asignados al rol',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async removePermissions(@Body() removePermissionDto: RemovePermissionDto): Promise<RolePermissionResponseDto> {
    return this.rolePermissionsService.removePermissions(removePermissionDto);
  }

  /**
   * Obtener todos los permisos de un rol
   */
  @Get('role/:roleId')
  @ApiOperation({
    summary: 'Obtener permisos de un rol',
    description: 'Obtiene todos los permisos asignados a un rol específico.',
  })
  @ApiParam({
    name: 'roleId',
    type: String,
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permisos del rol obtenidos exitosamente',
    type: RolePermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de rol inválido',
  })
  async getRolePermissions(@Param('roleId', ParseUUIDPipe) roleId: string): Promise<RolePermissionResponseDto> {
    return this.rolePermissionsService.getRolePermissions(roleId);
  }

  /**
   * Obtener permisos de un rol agrupados por recurso
   */
  @Get('role/:roleId/by-resource')
  @ApiOperation({
    summary: 'Obtener permisos de un rol agrupados por recurso',
    description: 'Obtiene todos los permisos de un rol organizados por recurso para facilitar la visualización.',
  })
  @ApiParam({
    name: 'roleId',
    type: String,
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permisos del rol agrupados por recurso obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            name: { type: 'string', example: 'Administrador' },
            description: { type: 'string', example: 'Rol con permisos administrativos' },
          },
        },
        permissionsByResource: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              resource: { type: 'string', example: 'users' },
              permissions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
                    name: { type: 'string', example: 'users:read' },
                    description: { type: 'string', example: 'Leer información de usuarios' },
                    action: { type: 'string', example: 'read' },
                    isActive: { type: 'boolean', example: true },
                  },
                },
              },
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
  async getRolePermissionsByResource(@Param('roleId', ParseUUIDPipe) roleId: string): Promise<{
    role: { id: string; name: string; description: string };
    permissionsByResource: Record<string, {
      resource: string;
      permissions: {
        id: string;
        name: string;
        description: string;
        action: string;
        isActive: boolean;
      }[];
    }>;
  }> {
    return this.rolePermissionsService.getRolePermissionsByResource(roleId);
  }

  /**
   * Obtener roles por permiso
   */
  @Get('permission/:permissionId/roles')
  @ApiOperation({
    summary: 'Obtener roles por permiso',
    description: 'Obtiene todos los roles que tienen asignado un permiso específico.',
  })
  @ApiParam({
    name: 'permissionId',
    type: String,
    description: 'ID único del permiso',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles con el permiso obtenidos exitosamente',
    type: PermissionRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permiso no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de permiso inválido',
  })
  async getRolesByPermission(@Param('permissionId', ParseUUIDPipe) permissionId: string): Promise<PermissionRoleResponseDto> {
    return this.rolePermissionsService.getRolesByPermission(permissionId);
  }

  /**
   * Reemplazar todos los permisos de un rol
   */
  @Put('role/:roleId/permissions')
  @ApiOperation({
    summary: 'Reemplazar permisos de un rol',
    description: 'Reemplaza todos los permisos actuales de un rol con una nueva lista de permisos.',
  })
  @ApiParam({
    name: 'roleId',
    type: String,
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array de IDs de permisos para asignar al rol',
          example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
        },
      },
      required: ['permissionIds'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permisos del rol reemplazados exitosamente',
    type: RolePermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rol no encontrado/inactivo o permisos no encontrados/inactivos',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async replaceRolePermissions(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body('permissionIds') permissionIds: string[],
  ): Promise<RolePermissionResponseDto> {
    return this.rolePermissionsService.replaceRolePermissions(roleId, permissionIds);
  }
}