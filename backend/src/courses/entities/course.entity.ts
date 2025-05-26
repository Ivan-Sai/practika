import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Grade } from '../../grades/entities/grade.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: true })
  acceptingGrades: boolean;

  @ManyToMany(() => Group)
  @JoinTable()
  groups: Group[];

  @OneToMany(() => Grade, (grade) => grade.course)
  grades: Grade[];
}