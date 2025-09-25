import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * Controlador de usuarios que maneja las operaciones CRUD
 */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtiene todos los usuarios
   * @returns Lista de usuarios
   */
  @ApiOperation({ summary: 'Obtener todos los usuarios', description: 'Retorna una lista de todos los usuarios registrados' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'Token de autenticación requerido' })
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * Obtiene un usuario por ID
   * @param id ID del usuario
   * @returns Usuario encontrado
   */
  @ApiOperation({ summary: 'Obtener usuario por ID', description: 'Retorna un usuario específico por su ID' })
  @ApiParam({ name: 'id', description: 'ID único del usuario', type: 'string' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'Token de autenticación requerido' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.findOne(id);
  }

  /**
   * Crea un nuevo usuario
   * @param createUserDto Datos del usuario
   * @returns Usuario creado
   */
  @ApiOperation({ summary: 'Crear nuevo usuario', description: 'Crea un nuevo usuario en el sistema' })
  @ApiBody({ type: CreateUserDto, description: 'Datos del usuario a crear' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 401, description: 'Token de autenticación requerido' })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    return this.usersService.create(createUserDto);
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario
   * @param updateUserDto Datos a actualizar
   * @returns Usuario actualizado
   */
  @ApiOperation({ summary: 'Actualizar usuario', description: 'Actualiza los datos de un usuario existente' })
  @ApiParam({ name: 'id', description: 'ID único del usuario', type: 'string' })
  @ApiBody({ type: UpdateUserDto, description: 'Datos del usuario a actualizar' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación requerido' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Elimina un usuario
   * @param id ID del usuario
   * @returns Resultado de la eliminación
   */
  @ApiOperation({ summary: 'Eliminar usuario', description: 'Elimina un usuario del sistema' })
  @ApiParam({ name: 'id', description: 'ID único del usuario', type: 'string' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'Token de autenticación requerido' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  /**
   * Obtiene los roles de un usuario específico
   * @param id ID del usuario
   * @returns Lista de roles del usuario
   */
  @ApiOperation({ 
    summary: 'Obtener roles de usuario', 
    description: 'Retorna la lista de roles asignados a un usuario específico' 
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario', type: 'string' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Roles del usuario obtenidos exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
          name: { type: 'string', example: 'administrador' },
          description: { type: 'string', example: 'Rol con permisos administrativos' }
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token de autenticación requerido' })
  @Get(':id/roles')
  getUserRoles(@Param('id') id: string): Promise<{ id: string; name: string; description: string }[]> {
    return this.usersService.getUserRoles(id);
  }

  /**
   * Verifica si un usuario tiene un rol específico
   * @param id ID del usuario
   * @param roleName Nombre del rol
   * @returns True si el usuario tiene el rol
   */
  @ApiOperation({ 
    summary: 'Verificar rol de usuario', 
    description: 'Verifica si un usuario tiene un rol específico asignado' 
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario', type: 'string' })
  @ApiParam({ name: 'roleName', description: 'Nombre del rol a verificar', type: 'string' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Verificación completada exitosamente',
    schema: {
      type: 'object',
      properties: {
        hasRole: { type: 'boolean', example: true },
        userId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        roleName: { type: 'string', example: 'administrador' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token de autenticación requerido' })
  @Get(':id/roles/:roleName/check')
  async checkUserRole(
    @Param('id') id: string, 
    @Param('roleName') roleName: string
  ): Promise<{ hasRole: boolean; userId: string; roleName: string }> {
    const hasRole = await this.usersService.hasRole(id, roleName);
    return {
      hasRole,
      userId: id,
      roleName
    };
  }

  /**
   * Asigna roles a un usuario
   * @param id ID del usuario
   * @param roleIds Array de IDs de roles a asignar
   * @returns Mensaje de confirmación
   */
  @ApiOperation({ summary: 'Asignar roles a usuario', description: 'Asigna uno o más roles a un usuario específico' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        roleIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array de IDs de roles a asignar'
        }
      },
      required: ['roleIds']
    }
  })
  @ApiResponse({ status: 200, description: 'Roles asignados exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @Post(':id/roles')
  async assignRoles(
    @Param('id') id: string,
    @Body('roleIds') roleIds: string[]
  ): Promise<{ message: string }> {
    await this.usersService.assignRoles(id, roleIds);
    return { message: 'Roles asignados exitosamente' };
  }

  /**
   * Remueve roles de un usuario
   * @param id ID del usuario
   * @param roleIds Array de IDs de roles a remover
   * @returns Mensaje de confirmación
   */
  @ApiOperation({ summary: 'Remover roles de usuario', description: 'Remueve uno o más roles de un usuario específico' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        roleIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array de IDs de roles a remover'
        }
      },
      required: ['roleIds']
    }
  })
  @ApiResponse({ status: 200, description: 'Roles removidos exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @Delete(':id/roles')
  async removeRoles(
    @Param('id') id: string,
    @Body('roleIds') roleIds: string[]
  ): Promise<{ message: string }> {
    await this.usersService.removeRoles(id, roleIds);
    return { message: 'Roles removidos exitosamente' };
  }
}