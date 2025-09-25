import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

/**
 * Entidad Role para el sistema de roles
 * Representa los diferentes roles que pueden tener los usuarios
 */
@Entity('roles')
export class Role {
  /**
   * ID único del rol
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nombre del rol (ej: administrador, usuario)
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  /**
   * Descripción del rol
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Indica si el rol está activo
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Relación con la tabla intermedia UserRole
   */
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  /**
   * Relación con la tabla intermedia RolePermission
   */
  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];

  /**
   * Fecha de creación del registro
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Fecha de última actualización del registro
   */
  @UpdateDateColumn()
  updatedAt: Date;
}