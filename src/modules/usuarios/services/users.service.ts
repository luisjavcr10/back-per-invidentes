import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import * as bcrypt from 'bcryptjs';

/**
 * Servicio de usuarios que maneja las operaciones CRUD
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Obtiene todos los usuarios (sin contraseñas) con sus roles
   * @returns Lista de usuarios con roles
   */
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: ['userRoles', 'userRoles.role'],
    });
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      // Filtrar solo roles activos
      if (userWithoutPassword.userRoles) {
        userWithoutPassword.userRoles = userWithoutPassword.userRoles.filter(
          ur => ur.isActive && ur.role && ur.role.isActive
        );
      }
      return userWithoutPassword as User;
    });
  }

  /**
   * Obtiene un usuario por ID con sus roles
   * @param id ID del usuario
   * @returns Usuario encontrado con roles
   */
  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const { password, ...userWithoutPassword } = user;
    // Filtrar solo roles activos
    if (userWithoutPassword.userRoles) {
      userWithoutPassword.userRoles = userWithoutPassword.userRoles.filter(
        ur => ur.isActive && ur.role && ur.role.isActive
      );
    }
    return userWithoutPassword as User;
  }

  /**
   * Crea un nuevo usuario con rol por defecto
   * @param createUserDto Datos del usuario
   * @returns Usuario creado con roles
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { password, roleIds, ...userData } = createUserDto;
    
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    
    const savedUser = await this.userRepository.save(user);
    
    // Asignar roles (si se proporcionan, sino asignar rol "usuario" por defecto)
    let rolesToAssign = roleIds || [];
    if (rolesToAssign.length === 0) {
      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'usuario', isActive: true }
      });
      if (defaultRole) {
        rolesToAssign = [defaultRole.id];
      }
    }
    
    if (rolesToAssign.length > 0) {
      const userRoles = rolesToAssign.map(roleId => {
        const userRole = new UserRole();
        userRole.userId = savedUser.id;
        userRole.roleId = roleId;
        return userRole;
      });
      await this.userRoleRepository.save(userRoles);
    }
    
    // Retornar usuario con roles
    return this.findOne(savedUser.id);
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario
   * @param updateUserDto Datos a actualizar
   * @returns Usuario actualizado
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const { password, ...updateData } = updateUserDto;
    
    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData['password'] = hashedPassword;
    }
    
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Elimina un usuario
   * @param id ID del usuario
   * @returns Resultado de la eliminación
   */
  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  /**
   * Busca un usuario por email (incluye contraseña para autenticación)
   * @param email Email del usuario
   * @returns Usuario con contraseña para autenticación
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  /**
   * Obtiene los roles de un usuario
   * @param userId ID del usuario
   * @returns Lista de roles del usuario
   */
  async getUserRoles(userId: string): Promise<{ id: string; name: string; description: string }[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return user.userRoles
      .filter(ur => ur.isActive && ur.role && ur.role.isActive)
      .map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      }));
  }

  /**
   * Verifica si un usuario tiene un rol específico
   * @param userId ID del usuario
   * @param roleName Nombre del rol
   * @returns True si el usuario tiene el rol
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const userRole = await this.userRoleRepository
      .createQueryBuilder('ur')
      .innerJoin('ur.role', 'r')
      .where('ur.userId = :userId', { userId })
      .andWhere('r.name = :roleName', { roleName })
      .andWhere('ur.isActive = true')
      .andWhere('r.isActive = true')
      .getOne();

    return !!userRole;
  }

  /**
   * Asigna roles a un usuario
   * @param userId ID del usuario
   * @param roleIds Array de IDs de roles a asignar
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que todos los roles existen y están activos
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds), isActive: true }
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('Uno o más roles no encontrados o inactivos');
    }

    // Verificar roles ya asignados
    const existingUserRoles = await this.userRoleRepository.find({
      where: { userId, roleId: In(roleIds), isActive: true }
    });

    const existingRoleIds = existingUserRoles.map(ur => ur.roleId);
    const newRoleIds = roleIds.filter(roleId => !existingRoleIds.includes(roleId));

    // Crear nuevas asignaciones de roles
    if (newRoleIds.length > 0) {
      const newUserRoles = newRoleIds.map(roleId => 
        this.userRoleRepository.create({
          userId,
          roleId,
          isActive: true
        })
      );

      await this.userRoleRepository.save(newUserRoles);
    }
  }

  /**
   * Remueve roles de un usuario
   * @param userId ID del usuario
   * @param roleIds Array de IDs de roles a remover
   */
  async removeRoles(userId: string, roleIds: string[]): Promise<void> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Buscar las asignaciones de roles activas
    const userRoles = await this.userRoleRepository.find({
      where: { userId, roleId: In(roleIds), isActive: true }
    });

    if (userRoles.length === 0) {
      throw new NotFoundException('No se encontraron roles asignados para remover');
    }

    // Desactivar las asignaciones de roles
    await this.userRoleRepository.update(
      { userId, roleId: In(roleIds), isActive: true },
      { isActive: false }
    );
  }
}