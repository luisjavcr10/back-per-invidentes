import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { RoleResponseDto } from '../dtos/role-response.dto';

/**
 * Controlador para gestión de roles
 */
@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Crear un nuevo rol
   */
  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo rol',
    description: 'Crea un nuevo rol en el sistema con los permisos especificados',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Rol creado exitosamente',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un rol con el mismo nombre',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * Obtener todos los roles con paginación y filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los roles',
    description: 'Obtiene una lista paginada de roles con filtros opcionales',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de elementos por página (por defecto: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Buscar por nombre o descripción del rol',
    example: 'admin',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo/inactivo',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de roles obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/RoleResponseDto' },
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('isActive', new DefaultValuePipe(undefined)) isActive?: boolean,
  ): Promise<{ data: RoleResponseDto[]; total: number; page: number; limit: number }> {
    return this.rolesService.findAll(page, limit, search, isActive);
  }

  /**
   * Obtener roles activos para selección
   */
  @Get('active')
  @ApiOperation({
    summary: 'Obtener roles activos',
    description: 'Obtiene una lista de todos los roles activos para uso en formularios de selección',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de roles activos obtenida exitosamente',
    type: [RoleResponseDto],
  })
  async findActiveRoles(): Promise<RoleResponseDto[]> {
    return this.rolesService.findActiveRoles();
  }

  /**
   * Obtener un rol por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un rol por ID',
    description: 'Obtiene los detalles de un rol específico incluyendo contadores de usuarios y permisos',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rol encontrado exitosamente',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de rol inválido',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RoleResponseDto> {
    return this.rolesService.findOne(id);
  }

  /**
   * Actualizar un rol
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un rol',
    description: 'Actualiza los datos de un rol existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rol actualizado exitosamente',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un rol con el mismo nombre',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.update(id, updateRoleDto);
  }

  /**
   * Eliminar un rol (soft delete)
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un rol',
    description: 'Desactiva un rol del sistema (soft delete). No se puede eliminar si tiene usuarios asignados.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Rol eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se puede eliminar el rol porque tiene usuarios asignados',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.rolesService.remove(id);
  }
}