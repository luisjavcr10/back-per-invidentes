import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Controlador de autenticación que maneja login, registro y perfil de usuario
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para registrar un nuevo usuario
   * @param registerDto Datos del usuario a registrar
   * @returns Usuario creado y token de acceso
   */
  @ApiOperation({ summary: 'Registrar nuevo usuario', description: 'Crea una nueva cuenta de usuario en el sistema' })
  @ApiBody({ type: RegisterDto, description: 'Datos del usuario a registrar' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Endpoint para autenticar un usuario
   * @param loginDto Credenciales de login
   * @returns Usuario y token de acceso
   */
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Autentica un usuario y devuelve un token JWT' })
  @ApiBody({ type: LoginDto, description: 'Credenciales de acceso' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve usuario y token' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint para obtener el perfil del usuario autenticado
   * @param req Request con usuario autenticado
   * @returns Perfil del usuario
   */
  @ApiOperation({ summary: 'Obtener perfil', description: 'Obtiene el perfil del usuario autenticado' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Perfil del usuario obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido o expirado' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}