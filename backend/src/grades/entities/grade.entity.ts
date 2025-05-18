import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity()
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  value: number;

  @ManyToOne(() => User, (user) => user.grades)
  student: User;

  @ManyToOne(() => Course, (course) => course.grades)
  course: Course;

  @ManyToOne(() => Group, { nullable: true })
  group: Group;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}