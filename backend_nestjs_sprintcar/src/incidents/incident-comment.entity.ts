import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tabla de comentarios / log de seguimiento de una incidencia.
// Tanto el usuario que reportó como el admin pueden añadir notas para dejar
// constancia de lo que está pasando: "enviado a taller", "presupuesto aprobado", etc.
@Entity('incident_comments')
export class IncidentCommentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Incidencia a la que pertenece este comentario.
  @Column({ name: 'incident_id', type: 'int' })
  incidentId!: number;

  // Usuario que escribió el comentario (puede ser el reportador o el admin).
  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  // Texto libre del comentario.
  @Column({ type: 'text' })
  text!: string;

  // Fecha y hora en que se escribió. La pone la base de datos automáticamente.
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
