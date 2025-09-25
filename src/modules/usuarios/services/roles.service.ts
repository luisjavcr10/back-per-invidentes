import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { RoleResponseDto } from '../dtos/role-response.dto';
import { plainToClass } from 'class-transformer';

/**
 * Servicio para gestión de roles
 */
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  /**
   * Crear un nuevo rol
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    // Verificar si ya existe un rol con el mismo nombre
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException(`Ya existe un rol con el nombre '${createRoleDto.name}'`);
    }

    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);
    
    return plainToClass(RoleResponseDto, savedRole, { excludeExtraneousValues: true });
  }

  /**
   * Obtener todos los roles con paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ): Promise<{ data: RoleResponseDto[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // Filtros
    if (search) {
      queryBuilder.where(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('role.isActive = :isActive', { isActive });
    }

    // Contar usuarios y permisos asociados
    queryBuilder
      .leftJoin('role.userRoles', 'userRole')
      .leftJoin('role.rolePermissions', 'rolePermission')
      .addSelect('COUNT(DISTINCT userRole.id)', 'userCount')
      .addSelect('COUNT(DISTINCT rolePermission.id)', 'permissionCount')
      .groupBy('role.id')
      .orderBy('role.createdAt', 'DESC');

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.offset(offset).limit(limit);

    const [roles, total] = await Promise.all([
      queryBuilder.getRawAndEntities(),
      queryBuilder.getCount(),
    ]);

    const rolesWithCounts = roles.entities.map((role, index) => {
      const raw = roles.raw[index];
      return {
        ...role,
        userCount: parseInt(raw.userCount) || 0,
        permissionCount: parseInt(raw.permissionCount) || 0,
      };
    });

    return {
      data: plainToClass(RoleResponseDto, rolesWithCounts, { excludeExtraneousValues: true }),
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener un rol por ID
   */
  async findOne(id: string): Promise<RoleResponseDto> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role')
      .leftJoin('role.userRoles', 'userRole')
      .leftJoin('role.rolePermissions', 'rolePermission')
      .addSelect('COUNT(DISTINCT userRole.id)', 'userCount')
      .addSelect('COUNT(DISTINCT rolePermission.id)', 'permissionCount')
      .where('role.id = :id', { id })
      .groupBy('role.id');

    const result = await queryBuilder.getRawAndEntities();
    
    if (!result.entities.length) {
      throw new NotFoundException(`Rol con ID '${id}' no encontrado`);
    }

    const role = result.entities[0];
    const raw = result.raw[0];
    
    const roleWithCounts = {
      ...role,
      userCount: parseInt(raw.userCount) || 0,
      permissionCount: parseInt(raw.permissionCount) || 0,
    };

    return plainToClass(RoleResponseDto, roleWithCounts, { excludeExtraneousValues: true });
  }

  /**
   * Actualizar un rol
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException(`Rol con ID '${id}' no encontrado`);
    }

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException(`Ya existe un rol con el nombre '${updateRoleDto.name}'`);
      }
    }

    Object.assign(role, updateRoleDto);
    const updatedRole = await this.roleRepository.save(role);
    
    return this.findOne(updatedRole.id);
  }

  /**
   * Eliminar un rol (soft delete)
   */
  async remove(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException(`Rol con ID '${id}' no encontrado`);
    }

    // Verificar si el rol tiene usuarios asignados
    const userCount = await this.userRoleRepository.count({
      where: { roleId: id, isActive: true },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el rol porque tiene ${userCount} usuario(s) asignado(s)`,
      );
    }

    // Desactivar el rol en lugar de eliminarlo
    role.isActive = false;
    await this.roleRepository.save(role);
  }

  /**
   * Obtener roles activos para selección
   */
  async findActiveRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    return plainToClass(RoleResponseDto, roles, { excludeExtraneousValues: true });
  }

  /**
   * Verificar si un rol existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.roleRepository.count({ where: { id } });
    return count > 0;
  }
}