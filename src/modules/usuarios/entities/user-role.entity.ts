import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

/**
 * Entidad UserRole - Tabla intermedia entre User y Role
 * Permite que un usuario tenga múltiples roles
 */
@Entity('user_roles')
export class UserRole {
  /**
   * ID único de la relación usuario-rol
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID del usuario
   */
  @Column({ type: 'uuid' })
  userId: string;

  /**
   * ID del rol
   */
  @Column({ type: 'uuid' })
  roleId: string;

  /**
   * Indica si la asignación del rol está activa
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Fecha de asignación del rol
   */
  @CreateDateColumn()
  assignedAt: Date;

  /**
   * Relación Many-to-One con User
   */
  @ManyToOne(() => User, user => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Relación Many-to-One con Role
   */
  @ManyToOne(() => Role, role => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;
}