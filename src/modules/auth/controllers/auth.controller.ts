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
   * @returns Respuesta estructurada con success, mensaje, usuario y token
   */
  @ApiOperation({ summary: 'Registrar nuevo usuario', description: 'Crea una nueva cuenta de usuario en el sistema' })
  @ApiBody({ type: RegisterDto, description: 'Datos del usuario a registrar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta del registro',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Indica si la operación fue exitosa' },
        message: { type: 'string', description: 'Mensaje descriptivo del resultado' },
        user: { type: 'object', description: 'Datos del usuario (null si error)' },
        access_token: { type: 'string', description: 'Token JWT (null si error)' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Endpoint para autenticar un usuario
   * @param loginDto Credenciales de login
   * @returns Respuesta estructurada con success, mensaje, usuario y token
   */
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Autentica un usuario y devuelve un token JWT' })
  @ApiBody({ type: LoginDto, description: 'Credenciales de acceso' })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta del login',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Indica si la operación fue exitosa' },
        message: { type: 'string', description: 'Mensaje descriptivo del resultado' },
        user: { type: 'object', description: 'Datos del usuario (null si error)' },
        access_token: { type: 'string', description: 'Token JWT (null si error)' }
      }
    }
  })
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