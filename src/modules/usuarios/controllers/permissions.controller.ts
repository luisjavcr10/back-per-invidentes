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
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { PermissionResponseDto } from '../dtos/permission-response.dto';

/**
 * Controlador para gestión de permisos
 */
@ApiTags('Permisos')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Crear un nuevo permiso
   */
  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo permiso',
    description: 'Crea un nuevo permiso en el sistema con el recurso y acción especificados',
  })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permiso creado exitosamente',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un permiso con el mismo nombre o combinación recurso-acción',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    return this.permissionsService.create(createPermissionDto);
  }

  /**
   * Obtener todos los permisos con paginación y filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los permisos',
    description: 'Obtiene una lista paginada de permisos con filtros opcionales',
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
    description: 'Buscar por nombre, descripción o recurso del permiso',
    example: 'user',
  })
  @ApiQuery({
    name: 'resource',
    required: false,
    type: String,
    description: 'Filtrar por recurso específico',
    example: 'users',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    type: String,
    description: 'Filtrar por acción específica',
    example: 'read',
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
    description: 'Lista de permisos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/PermissionResponseDto' },
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('isActive', new DefaultValuePipe(undefined)) isActive?: boolean,
  ): Promise<{ data: PermissionResponseDto[]; total: number; page: number; limit: number }> {
    return this.permissionsService.findAll(page, limit, search, resource, action, isActive);
  }

  /**
   * Obtener permisos activos para selección
   */
  @Get('active')
  @ApiOperation({
    summary: 'Obtener permisos activos',
    description: 'Obtiene una lista de todos los permisos activos para uso en formularios de selección',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de permisos activos obtenida exitosamente',
    type: [PermissionResponseDto],
  })
  async findActivePermissions(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findActivePermissions();
  }

  /**
   * Obtener recursos únicos
   */
  @Get('resources')
  @ApiOperation({
    summary: 'Obtener lista de recursos únicos',
    description: 'Obtiene una lista de todos los recursos únicos disponibles en el sistema',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de recursos obtenida exitosamente',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['users', 'roles', 'permissions', 'reports'],
    },
  })
  async getUniqueResources(): Promise<string[]> {
    return this.permissionsService.getUniqueResources();
  }

  /**
   * Obtener acciones únicas
   */
  @Get('actions')
  @ApiOperation({
    summary: 'Obtener lista de acciones únicas',
    description: 'Obtiene una lista de todas las acciones únicas disponibles en el sistema',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de acciones obtenida exitosamente',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['create', 'read', 'update', 'delete', 'manage'],
    },
  })
  async getUniqueActions(): Promise<string[]> {
    return this.permissionsService.getUniqueActions();
  }

  /**
   * Obtener un permiso por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un permiso por ID',
    description: 'Obtiene los detalles de un permiso específico incluyendo contador de roles',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permiso encontrado exitosamente',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permiso no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de permiso inválido',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PermissionResponseDto> {
    return this.permissionsService.findOne(id);
  }

  /**
   * Actualizar un permiso
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un permiso',
    description: 'Actualiza los datos de un permiso existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permiso actualizado exitosamente',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permiso no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un permiso con el mismo nombre o combinación recurso-acción',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  /**
   * Eliminar un permiso (soft delete)
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un permiso',
    description: 'Desactiva un permiso del sistema (soft delete). No se puede eliminar si está asignado a roles.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Permiso eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permiso no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se puede eliminar el permiso porque está asignado a roles',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}