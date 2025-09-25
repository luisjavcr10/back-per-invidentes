import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { PermissionResponseDto } from '../dtos/permission-response.dto';
import { plainToClass } from 'class-transformer';

/**
 * Servicio para gestión de permisos
 */
@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  /**
   * Crear un nuevo permiso
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new ConflictException(`Ya existe un permiso con el nombre '${createPermissionDto.name}'`);
    }

    // Verificar si ya existe un permiso con la misma combinación recurso-acción
    const existingResourceAction = await this.permissionRepository.findOne({
      where: {
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
      },
    });

    if (existingResourceAction) {
      throw new ConflictException(
        `Ya existe un permiso para la acción '${createPermissionDto.action}' en el recurso '${createPermissionDto.resource}'`,
      );
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    const savedPermission = await this.permissionRepository.save(permission);
    
    return plainToClass(PermissionResponseDto, savedPermission, { excludeExtraneousValues: true });
  }

  /**
   * Obtener todos los permisos con paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    resource?: string,
    action?: string,
    isActive?: boolean,
  ): Promise<{ data: PermissionResponseDto[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    // Filtros
    if (search) {
      queryBuilder.where(
        '(permission.name ILIKE :search OR permission.description ILIKE :search OR permission.resource ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (resource) {
      queryBuilder.andWhere('permission.resource = :resource', { resource });
    }

    if (action) {
      queryBuilder.andWhere('permission.action = :action', { action });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('permission.isActive = :isActive', { isActive });
    }

    // Contar roles asociados
    queryBuilder
      .leftJoin('permission.rolePermissions', 'rolePermission')
      .addSelect('COUNT(DISTINCT rolePermission.id)', 'roleCount')
      .groupBy('permission.id')
      .orderBy('permission.resource', 'ASC')
      .addOrderBy('permission.action', 'ASC');

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.offset(offset).limit(limit);

    const [permissions, total] = await Promise.all([
      queryBuilder.getRawAndEntities(),
      queryBuilder.getCount(),
    ]);

    const permissionsWithCounts = permissions.entities.map((permission, index) => {
      const raw = permissions.raw[index];
      return {
        ...permission,
        roleCount: parseInt(raw.roleCount) || 0,
      };
    });

    return {
      data: plainToClass(PermissionResponseDto, permissionsWithCounts, { excludeExtraneousValues: true }),
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener un permiso por ID
   */
  async findOne(id: string): Promise<PermissionResponseDto> {
    const queryBuilder = this.permissionRepository.createQueryBuilder('permission')
      .leftJoin('permission.rolePermissions', 'rolePermission')
      .addSelect('COUNT(DISTINCT rolePermission.id)', 'roleCount')
      .where('permission.id = :id', { id })
      .groupBy('permission.id');

    const result = await queryBuilder.getRawAndEntities();
    
    if (!result.entities.length) {
      throw new NotFoundException(`Permiso con ID '${id}' no encontrado`);
    }

    const permission = result.entities[0];
    const raw = result.raw[0];
    
    const permissionWithCounts = {
      ...permission,
      roleCount: parseInt(raw.roleCount) || 0,
    };

    return plainToClass(PermissionResponseDto, permissionWithCounts, { excludeExtraneousValues: true });
  }

  /**
   * Actualizar un permiso
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    
    if (!permission) {
      throw new NotFoundException(`Permiso con ID '${id}' no encontrado`);
    }

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updatePermissionDto.name },
      });

      if (existingPermission) {
        throw new ConflictException(`Ya existe un permiso con el nombre '${updatePermissionDto.name}'`);
      }
    }

    // Verificar si la nueva combinación recurso-acción ya existe (si se está cambiando)
    if (
      (updatePermissionDto.resource && updatePermissionDto.resource !== permission.resource) ||
      (updatePermissionDto.action && updatePermissionDto.action !== permission.action)
    ) {
      const newResource = updatePermissionDto.resource || permission.resource;
      const newAction = updatePermissionDto.action || permission.action;
      
      const existingResourceAction = await this.permissionRepository.findOne({
        where: {
          resource: newResource,
          action: newAction,
        },
      });

      if (existingResourceAction && existingResourceAction.id !== id) {
        throw new ConflictException(
          `Ya existe un permiso para la acción '${newAction}' en el recurso '${newResource}'`,
        );
      }
    }

    Object.assign(permission, updatePermissionDto);
    const updatedPermission = await this.permissionRepository.save(permission);
    
    return this.findOne(updatedPermission.id);
  }

  /**
   * Eliminar un permiso (soft delete)
   */
  async remove(id: string): Promise<void> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    
    if (!permission) {
      throw new NotFoundException(`Permiso con ID '${id}' no encontrado`);
    }

    // Verificar si el permiso tiene roles asignados
    const roleCount = await this.rolePermissionRepository.count({
      where: { permissionId: id, isActive: true },
    });

    if (roleCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el permiso porque está asignado a ${roleCount} rol(es)`,
      );
    }

    // Desactivar el permiso en lugar de eliminarlo
    permission.isActive = false;
    await this.permissionRepository.save(permission);
  }

  /**
   * Obtener permisos activos para selección
   */
  async findActivePermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.find({
      where: { isActive: true },
      order: { resource: 'ASC', action: 'ASC' },
    });

    return plainToClass(PermissionResponseDto, permissions, { excludeExtraneousValues: true });
  }

  /**
   * Obtener recursos únicos
   */
  async getUniqueResources(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.resource', 'resource')
      .where('permission.isActive = :isActive', { isActive: true })
      .orderBy('permission.resource', 'ASC')
      .getRawMany();

    return result.map(item => item.resource);
  }

  /**
   * Obtener acciones únicas
   */
  async getUniqueActions(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.action', 'action')
      .where('permission.isActive = :isActive', { isActive: true })
      .orderBy('permission.action', 'ASC')
      .getRawMany();

    return result.map(item => item.action);
  }

  /**
   * Verificar si un permiso existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.permissionRepository.count({ where: { id } });
    return count > 0;
  }
}