import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

/**
 * Entidad RolePermission - Tabla intermedia entre Role y Permission
 * Permite que un rol tenga múltiples permisos
 */
@Entity('role_permissions')
export class RolePermission {
  /**
   * ID único de la relación rol-permiso
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID del rol
   */
  @Column({ type: 'uuid' })
  roleId: string;

  /**
   * ID del permiso
   */
  @Column({ type: 'uuid' })
  permissionId: string;

  /**
   * Indica si la asignación del permiso está activa
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Fecha de asignación del permiso
   */
  @CreateDateColumn()
  assignedAt: Date;

  /**
   * Relación Many-to-One con Role
   */
  @ManyToOne(() => Role, role => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  /**
   * Relación Many-to-One con Permission
   */
  @ManyToOne(() => Permission, permission => permission.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;
}