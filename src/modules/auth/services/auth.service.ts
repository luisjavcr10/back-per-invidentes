import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../usuarios/entities/user.entity';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { UsersService } from '../../usuarios/services/users.service';

/**
 * Servicio de autenticación que maneja login, registro y validación de usuarios
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema
   * @param registerDto Datos del usuario a registrar
   * @returns Respuesta estructurada con success, usuario creado y token JWT
   */
  async register(registerDto: RegisterDto) {
    const { email, password, ...userData } = registerDto;

    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return {
          success: false,
          message: 'El usuario ya existe',
          user: null,
          access_token: null,
        };
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el usuario
      const user = this.userRepository.create({
        ...userData,
        email,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);

      // Generar token JWT
      const payload = { sub: savedUser.id, email: savedUser.email };
      const token = this.jwtService.sign(payload);

      // Remover la contraseña de la respuesta
      const { password: _, ...userWithoutPassword } = savedUser;

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword,
        access_token: token,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error interno del servidor',
        user: null,
        access_token: null,
      };
    }
  }

  /**
   * Autentica un usuario con email y contraseña
   * @param loginDto Credenciales de login
   * @returns Respuesta estructurada con success, usuario y token JWT
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Buscar el usuario por email con sus roles
      const user = await this.userRepository.findOne({ 
        where: { email },
        relations: ['userRoles', 'userRoles.role']
      });
      
      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas',
          user: null,
          access_token: null,
        };
      }

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciales inválidas',
          user: null,
          access_token: null,
        };
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        return {
          success: false,
          message: 'Usuario inactivo',
          user: null,
          access_token: null,
        };
      }

      // Verificar que el usuario tenga el rol de administrador
      // Método 1: Verificación directa con las relaciones cargadas
      const hasAdminRole = user.userRoles?.some(userRole => 
        userRole.role?.name === 'administrador' && 
        userRole.isActive && 
        userRole.role?.isActive
      );

      // Método 2: Verificación alternativa usando el servicio de usuarios (más robusta)
      let hasAdminRoleAlternative = false;
      try {
        hasAdminRoleAlternative = await this.usersService.hasRole(user.id, 'administrador');
      } catch (roleCheckError) {
        this.logger.warn(`Error verificando rol para usuario ${user.id}: ${roleCheckError.message}`);
      }

      // Usar cualquiera de los dos métodos que confirme el rol
      const isAdmin = hasAdminRole || hasAdminRoleAlternative;

      if (!isAdmin) {
        this.logger.warn(`Intento de acceso denegado para usuario ${user.email} - Sin rol de administrador`);
        return {
          success: false,
          message: 'No tienes permisos para acceder',
          user: null,
          access_token: null,
        };
      }

      // Generar token JWT
      const payload = { sub: user.id, email: user.email, roles: user.userRoles?.map(ur => ur.role?.name).filter(Boolean) };
      const token = this.jwtService.sign(payload);

      // Remover la contraseña de la respuesta
      const { password: _, ...userWithoutPassword } = user;

      this.logger.log(`Login exitoso para administrador: ${user.email}`);
      return {
        success: true,
        message: 'Login exitoso',
        user: userWithoutPassword,
        access_token: token,
      };
    } catch (error) {
      this.logger.error(`Error en login para email ${email}: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Error interno del servidor',
        user: null,
        access_token: null,
      };
    }
  }

  /**
   * Valida un usuario por ID (usado por JWT strategy)
   * @param userId ID del usuario
   * @returns Usuario sin contraseña
   */
  async validateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}