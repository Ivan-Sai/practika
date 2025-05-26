import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Group } from '../groups/entities/group.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto);
    return this.coursesRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find();
  }

  async findPublic(): Promise<Course[]> {
    return this.coursesRepository.find({ 
      where: { isPublic: true },
      select: ['id', 'name', 'description']
    });
  }

  async findPublicCourse(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id, isPublic: true },
      select: ['id', 'name', 'description']
    });
    
    if (!course) {
      throw new NotFoundException(`Public course with ID ${id} not found`);
    }
    
    return course;
  }

  async findPublicCourseGroups(id: string): Promise<Group[]> {
    const course = await this.coursesRepository.findOne({
      where: { id, isPublic: true },
      relations: ['groups'],
    });
    
    if (!course) {
      throw new NotFoundException(`Public course with ID ${id} not found`);
    }
    
    return course.groups;
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['groups'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return this.coursesRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const result = await this.coursesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  async addGroup(courseId: string, groupId: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: ['groups'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if group is already added
    const groupExists = course.groups.some(g => g.id === groupId);
    if (!groupExists) {
      course.groups.push(group);
      return this.coursesRepository.save(course);
    }

    return course;
  }

  async removeGroup(courseId: string, groupId: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: ['groups'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    course.groups = course.groups.filter(group => group.id !== groupId);
    return this.coursesRepository.save(course);
  }
}