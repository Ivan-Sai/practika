import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Course, course => course.groups)
  courses: Course[];
}