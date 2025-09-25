import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import {
  AssignPermissionDto,
  RemovePermissionDto,
  RolePermissionResponseDto,
  PermissionRoleResponseDto,
} from '../dtos/assign-permission.dto';

/**
 * Servicio para gestionar la asignación de permisos a roles
 */
@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(assignPermissionDto: AssignPermissionDto): Promise<RolePermissionResponseDto> {
    const { roleId, permissionIds } = assignPermissionDto;

    // Verificar que el rol existe y está activo
    const role = await this.roleRepository.findOne({
      where: { id: roleId, isActive: true },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado o está inactivo`);
    }

    // Verificar que todos los permisos existen y están activos
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds), isActive: true },
    });

    if (permissions.length !== permissionIds.length) {
      const foundPermissionIds = permissions.map(permission => permission.id);
      const missingPermissionIds = permissionIds.filter(id => !foundPermissionIds.includes(id));
      throw new NotFoundException(
        `Los siguientes permisos no fueron encontrados o están inactivos: ${missingPermissionIds.join(', ')}`
      );
    }

    // Verificar permisos ya asignados
    const existingRolePermissions = role.rolePermissions || [];
    const existingPermissionIds = existingRolePermissions.map(rp => rp.permissionId);
    const newPermissionIds = permissionIds.filter(permissionId => !existingPermissionIds.includes(permissionId));

    if (newPermissionIds.length === 0) {
      throw new ConflictException('Todos los permisos ya están asignados al rol');
    }

    // Crear nuevas asignaciones de permisos
    const newRolePermissions = newPermissionIds.map(permissionId => {
      const rolePermission = new RolePermission();
      rolePermission.roleId = roleId;
      rolePermission.permissionId = permissionId;
      rolePermission.assignedAt = new Date();
      return rolePermission;
    });

    await this.rolePermissionRepository.save(newRolePermissions);

    // Obtener el rol actualizado con todos sus permisos
    return this.getRoleWithPermissions(roleId);
  }

  /**
   * Remover permisos de un rol
   */
  async removePermissions(removePermissionDto: RemovePermissionDto): Promise<RolePermissionResponseDto> {
    const { roleId, permissionIds } = removePermissionDto;

    // Verificar que el rol existe
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }

    // Verificar que los permisos están asignados al rol
    const rolePermissions = await this.rolePermissionRepository.find({
      where: {
        roleId,
        permissionId: In(permissionIds),
      },
    });

    if (rolePermissions.length === 0) {
      throw new NotFoundException('Ninguno de los permisos especificados está asignado al rol');
    }

    if (rolePermissions.length !== permissionIds.length) {
      const foundPermissionIds = rolePermissions.map(rp => rp.permissionId);
      const missingPermissionIds = permissionIds.filter(id => !foundPermissionIds.includes(id));
      throw new NotFoundException(
        `Los siguientes permisos no están asignados al rol: ${missingPermissionIds.join(', ')}`
      );
    }

    // Remover las asignaciones de permisos
    await this.rolePermissionRepository.remove(rolePermissions);

    // Obtener el rol actualizado con sus permisos restantes
    return this.getRoleWithPermissions(roleId);
  }

  /**
   * Obtener todos los permisos de un rol
   */
  async getRolePermissions(roleId: string): Promise<RolePermissionResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }

    return this.getRoleWithPermissions(roleId);
  }

  /**
   * Obtener roles por permiso
   */
  async getRolesByPermission(permissionId: string): Promise<PermissionRoleResponseDto> {
    // Verificar que el permiso existe
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${permissionId} no encontrado`);
    }

    // Obtener roles con este permiso
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { permissionId },
      relations: ['role'],
    });

    const roles = rolePermissions
      .filter(rp => rp.role && rp.role.isActive)
      .map(rp => ({
        id: rp.role.id,
        name: rp.role.name,
        description: rp.role.description,
        assignedAt: rp.assignedAt,
      }));

    return {
      permission: {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
      },
      roles,
    };
  }

  /**
   * Reemplazar todos los permisos de un rol
   */
  async replaceRolePermissions(roleId: string, permissionIds: string[]): Promise<RolePermissionResponseDto> {
    // Verificar que el rol existe y está activo
    const role = await this.roleRepository.findOne({
      where: { id: roleId, isActive: true },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado o está inactivo`);
    }

    // Verificar que todos los permisos existen y están activos
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds), isActive: true },
    });

    if (permissions.length !== permissionIds.length) {
      const foundPermissionIds = permissions.map(permission => permission.id);
      const missingPermissionIds = permissionIds.filter(id => !foundPermissionIds.includes(id));
      throw new NotFoundException(
        `Los siguientes permisos no fueron encontrados o están inactivos: ${missingPermissionIds.join(', ')}`
      );
    }

    // Remover todos los permisos actuales del rol
    await this.rolePermissionRepository.delete({ roleId });

    // Asignar los nuevos permisos
    if (permissionIds.length > 0) {
      const newRolePermissions = permissionIds.map(permissionId => {
        const rolePermission = new RolePermission();
        rolePermission.roleId = roleId;
        rolePermission.permissionId = permissionId;
        rolePermission.assignedAt = new Date();
        return rolePermission;
      });

      await this.rolePermissionRepository.save(newRolePermissions);
    }

    return this.getRoleWithPermissions(roleId);
  }

  /**
   * Obtener permisos agrupados por recurso para un rol
   */
  async getRolePermissionsByResource(roleId: string): Promise<{
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
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    const permissionsByResource: Record<string, any> = {};

    rolePermissions
      .filter(rp => rp.permission && rp.permission.isActive)
      .forEach(rp => {
        const resource = rp.permission.resource;
        if (!permissionsByResource[resource]) {
          permissionsByResource[resource] = {
            resource,
            permissions: [],
          };
        }
        permissionsByResource[resource].permissions.push({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          action: rp.permission.action,
          isActive: rp.permission.isActive,
        });
      });

    return {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
      permissionsByResource,
    };
  }

  /**
   * Método auxiliar para obtener un rol con sus permisos
   */
  private async getRoleWithPermissions(roleId: string): Promise<RolePermissionResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    const permissions = (role.rolePermissions || [])
      .filter(rp => rp.permission && rp.permission.isActive)
      .map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        resource: rp.permission.resource,
        action: rp.permission.action,
        isActive: rp.permission.isActive,
      }));

    return {
      roleId: role.id,
      roleName: role.name,
      roleDescription: role.description,
      roleIsActive: role.isActive,
      permissions,
      updatedAt: new Date(),
    };
  }
}