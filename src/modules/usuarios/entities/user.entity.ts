import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';

/**
 * Entidad Usuario para personas invidentes
 * Representa la tabla de usuarios en la base de datos
 */
@Entity('users')
export class User {
  /**
   * ID único del usuario
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nombre completo del usuario
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Correo electrónico del usuario
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * Contraseña del usuario (hasheada)
   */
  @Column({ type: 'varchar', length: 255 })
  password: string;

  /**
   * Teléfono del usuario
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  /**
   * Indica si el usuario está activo
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Relación con la tabla intermedia UserRole
   */
  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

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