import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
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
}