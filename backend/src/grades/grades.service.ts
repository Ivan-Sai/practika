import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Group } from '../groups/entities/group.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
  ) {}

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const student = await this.usersRepository.findOne({
      where: { id: createGradeDto.studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${createGradeDto.studentId} not found`);
    }

    const course = await this.coursesRepository.findOne({
      where: { id: createGradeDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${createGradeDto.courseId} not found`);
    }

    if (!course.acceptingGrades) {
      throw new ForbiddenException(`Course ${course.name} is not accepting grades`);
    }

    let group = null;
    if (createGradeDto.groupId) {
      group = await this.groupsRepository.findOne({
        where: { id: createGradeDto.groupId },
      });
      if (!group) {
        throw new NotFoundException(`Group with ID ${createGradeDto.groupId} not found`);
      }
    }

    const grade = this.gradesRepository.create({
      value: createGradeDto.value,
      student,
      course,
      group,
    });

    return this.gradesRepository.save(grade);
  }

  async findAll(): Promise<Grade[]> {
    return this.gradesRepository.find({
      relations: ['student', 'course', 'group'],
    });
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradesRepository.findOne({
      where: { id },
      relations: ['student', 'course', 'group'],
    });
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  async findByStudent(studentId: string): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { student: { id: studentId } },
      relations: ['course', 'group'],
    });
  }

  async findByCourse(courseId: string): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { course: { id: courseId } },
      relations: ['student', 'group'],
    });
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);

    if (!grade.course.acceptingGrades) {
      throw new ForbiddenException(`Course ${grade.course.name} is not accepting grades`);
    }

    if (updateGradeDto.value !== undefined) {
      grade.value = updateGradeDto.value;
    }

    if (updateGradeDto.groupId !== undefined) {
      if (updateGradeDto.groupId === null) {
        grade.group = null;
      } else {
        const group = await this.groupsRepository.findOne({
          where: { id: updateGradeDto.groupId },
        });
        if (!group) {
          throw new NotFoundException(`Group with ID ${updateGradeDto.groupId} not found`);
        }
        grade.group = group;
      }
    }

    return this.gradesRepository.save(grade);
  }

  async remove(id: string, user: User): Promise<void> {
    const grade = await this.findOne(id);

    // Only admins can delete any grade, students can only delete their own grades
    if (user.role !== UserRole.ADMIN && grade.student.id !== user.id) {
      throw new ForbiddenException('You can only delete your own grades');
    }

    // Check if the course is accepting grades
    if (!grade.course.acceptingGrades) {
      throw new ForbiddenException(`Course ${grade.course.name} is not accepting grades`);
    }

    await this.gradesRepository.remove(grade);
  }

  async getDistribution(courseId: string): Promise<any> {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    if (!course.isPublic) {
      throw new ForbiddenException(`Course ${course.name} is not public`);
    }

    const grades = await this.gradesRepository.find({
      where: { course: { id: courseId } },
      relations: ['group'],
    });

    // Calculate distribution statistics
    const allValues = grades.map(grade => grade.value);
    const groups = {};

    // Group grades by group
    grades.forEach(grade => {
      const groupName = grade.group ? grade.group.name : 'No Group';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(grade.value);
    });

    // Calculate statistics for each group
    const groupStats = {};
    for (const [groupName, values] of Object.entries(groups)) {
      groupStats[groupName] = this.calculateStats(values as number[]);
    }

    return {
      courseName: course.name,
      overall: this.calculateStats(allValues),
      groups: groupStats,
      totalGrades: allValues.length,
    };
  }

  async getGroupDistribution(courseId: string, groupId: string): Promise<any> {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    if (!course.isPublic) {
      throw new ForbiddenException(`Course ${course.name} is not public`);
    }

    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const grades = await this.gradesRepository.find({
      where: { course: { id: courseId }, group: { id: groupId } },
    });

    const values = grades.map(grade => grade.value);

    return {
      courseName: course.name,
      group: group.name,
      stats: this.calculateStats(values),
      totalGrades: values.length,
    };
  }

  private calculateStats(values: number[]) {
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        standardDeviation: 0,
        distribution: {},
      };
    }

    // Sort values for calculations
    const sortedValues = [...values].sort((a, b) => a - b);

    // Calculate basic statistics
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const sum = sortedValues.reduce((acc, val) => acc + val, 0);
    const mean = sum / sortedValues.length;

    // Calculate median
    let median;
    const mid = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 0) {
      median = (sortedValues[mid - 1] + sortedValues[mid]) / 2;
    } else {
      median = sortedValues[mid];
    }

    // Calculate standard deviation
    const squaredDifferences = sortedValues.map(val => Math.pow(val - mean, 2));
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / sortedValues.length;
    const standardDeviation = Math.sqrt(variance);

    // Create distribution histogram
    // We'll create 10 bins from min to max
    const binCount = 10;
    const binSize = (max - min) / binCount || 1; // Avoid division by zero
    const distribution = {};

    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
      distribution[binLabel] = 0;
    }

    // Count values in each bin
    sortedValues.forEach(val => {
      for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize;
        const binEnd = binStart + binSize;
        const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;

        if (val >= binStart && (val < binEnd || (i === binCount - 1 && val === binEnd))) {
          distribution[binLabel]++;
          break;
        }
      }
    });

    return {
      min,
      max,
      mean,
      median,
      standardDeviation,
      distribution,
    };
  }

  async generateNormalCurve(courseId: string, points: number = 100): Promise<any> {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    if (!course.isPublic) {
      throw new ForbiddenException(`Course ${course.name} is not public`);
    }

    const grades = await this.gradesRepository.find({
      where: { course: { id: courseId } },
    });

    const values = grades.map(grade => grade.value);
    if (values.length === 0) {
      throw new NotFoundException('No grades found for this course');
    }

    // Calculate mean and standard deviation
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Generate normal distribution curve points
    const min = Math.max(0, mean - 3 * standardDeviation);
    const max = Math.min(100, mean + 3 * standardDeviation);
    const step = (max - min) / points;

    const normalCurve = [];
    for (let i = 0; i <= points; i++) {
      const x = min + i * step;
      const y = this.normalPDF(x, mean, standardDeviation);
      normalCurve.push({ x, y });
    }

    return {
      courseName: course.name,
      mean,
      standardDeviation,
      normalCurve,
    };
  }

  // Normal probability density function
  private normalPDF(x: number, mean: number, stdDev: number): number {
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
  }
}