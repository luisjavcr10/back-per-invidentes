import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { AssignRoleDto, RemoveRoleDto, UserRoleResponseDto } from '../dtos/assign-role.dto';

/**
 * Servicio para gestionar la asignación de roles a usuarios
 */
@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * Asignar roles a un usuario
   */
  async assignRoles(assignRoleDto: AssignRoleDto): Promise<UserRoleResponseDto> {
    const { userId, roleIds } = assignRoleDto;

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que todos los roles existen y están activos
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds), isActive: true },
    });

    if (roles.length !== roleIds.length) {
      const foundRoleIds = roles.map(role => role.id);
      const missingRoleIds = roleIds.filter(id => !foundRoleIds.includes(id));
      throw new NotFoundException(
        `Los siguientes roles no fueron encontrados o están inactivos: ${missingRoleIds.join(', ')}`
      );
    }

    // Verificar roles ya asignados
    const existingUserRoles = user.userRoles || [];
    const existingRoleIds = existingUserRoles.map(ur => ur.roleId);
    const newRoleIds = roleIds.filter(roleId => !existingRoleIds.includes(roleId));

    if (newRoleIds.length === 0) {
      throw new ConflictException('Todos los roles ya están asignados al usuario');
    }

    // Crear nuevas asignaciones de roles
    const newUserRoles = newRoleIds.map(roleId => {
      const userRole = new UserRole();
      userRole.userId = userId;
      userRole.roleId = roleId;
      userRole.assignedAt = new Date();
      return userRole;
    });

    await this.userRoleRepository.save(newUserRoles);

    // Obtener el usuario actualizado con todos sus roles
    return this.getUserWithRoles(userId);
  }

  /**
   * Remover roles de un usuario
   */
  async removeRoles(removeRoleDto: RemoveRoleDto): Promise<UserRoleResponseDto> {
    const { userId, roleIds } = removeRoleDto;

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que los roles están asignados al usuario
    const userRoles = await this.userRoleRepository.find({
      where: {
        userId,
        roleId: In(roleIds),
      },
    });

    if (userRoles.length === 0) {
      throw new NotFoundException('Ninguno de los roles especificados está asignado al usuario');
    }

    if (userRoles.length !== roleIds.length) {
      const foundRoleIds = userRoles.map(ur => ur.roleId);
      const missingRoleIds = roleIds.filter(id => !foundRoleIds.includes(id));
      throw new NotFoundException(
        `Los siguientes roles no están asignados al usuario: ${missingRoleIds.join(', ')}`
      );
    }

    // Remover las asignaciones de roles
    await this.userRoleRepository.remove(userRoles);

    // Obtener el usuario actualizado con sus roles restantes
    return this.getUserWithRoles(userId);
  }

  /**
   * Obtener todos los roles de un usuario
   */
  async getUserRoles(userId: string): Promise<UserRoleResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return this.getUserWithRoles(userId);
  }

  /**
   * Obtener usuarios por rol
   */
  async getUsersByRole(roleId: string): Promise<{
    role: { id: string; name: string; description: string };
    users: { id: string; name: string; email: string; assignedAt: Date }[];
  }> {
    // Verificar que el rol existe
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }

    // Obtener usuarios con este rol
    const userRoles = await this.userRoleRepository.find({
      where: { roleId },
      relations: ['user'],
    });

    const users = userRoles.map(ur => ({
      id: ur.user.id,
      name: ur.user.name,
      email: ur.user.email,
      assignedAt: ur.assignedAt,
    }));

    return {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
      users,
    };
  }

  /**
   * Reemplazar todos los roles de un usuario
   */
  async replaceUserRoles(userId: string, roleIds: string[]): Promise<UserRoleResponseDto> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que todos los roles existen y están activos
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds), isActive: true },
    });

    if (roles.length !== roleIds.length) {
      const foundRoleIds = roles.map(role => role.id);
      const missingRoleIds = roleIds.filter(id => !foundRoleIds.includes(id));
      throw new NotFoundException(
        `Los siguientes roles no fueron encontrados o están inactivos: ${missingRoleIds.join(', ')}`
      );
    }

    // Remover todos los roles actuales del usuario
    await this.userRoleRepository.delete({ userId });

    // Asignar los nuevos roles
    if (roleIds.length > 0) {
      const newUserRoles = roleIds.map(roleId => {
        const userRole = new UserRole();
        userRole.userId = userId;
        userRole.roleId = roleId;
        userRole.assignedAt = new Date();
        return userRole;
      });

      await this.userRoleRepository.save(newUserRoles);
    }

    return this.getUserWithRoles(userId);
  }

  /**
   * Método auxiliar para obtener un usuario con sus roles
   */
  private async getUserWithRoles(userId: string): Promise<UserRoleResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    const roles = (user.userRoles || [])
      .filter(ur => ur.role && ur.role.isActive)
      .map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
        isActive: ur.role.isActive,
      }));

    return {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      roles,
      updatedAt: new Date(),
    };
  }
}