import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RolePermission } from './role-permission.entity';

/**
 * Entidad Permission para el sistema de permisos
 * Representa los diferentes permisos que pueden tener los roles
 */
@Entity('permissions')
export class Permission {
  /**
   * ID único del permiso
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nombre del permiso (ej: create_user, read_user, update_user, delete_user)
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  /**
   * Descripción del permiso
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Recurso al que aplica el permiso (ej: users, roles, permissions)
   */
  @Column({ type: 'varchar', length: 100 })
  resource: string;

  /**
   * Acción que permite el permiso (ej: create, read, update, delete)
   */
  @Column({ type: 'varchar', length: 50 })
  action: string;

  /**
   * Indica si el permiso está activo
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Relación con la tabla intermedia RolePermission
   */
  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
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