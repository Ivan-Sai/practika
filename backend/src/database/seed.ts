import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Group } from '../groups/entities/group.entity';
import { Grade } from '../grades/entities/grade.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const courseRepository = app.get<Repository<Course>>(getRepositoryToken(Course));
  const groupRepository = app.get<Repository<Group>>(getRepositoryToken(Group));
  const gradeRepository = app.get<Repository<Grade>>(getRepositoryToken(Grade));

  // Clear existing data
  await gradeRepository.delete({});
  await userRepository.delete({});
  await courseRepository.delete({});
  await groupRepository.delete({});

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepository.create({
    email: 'admin@example.com',
    password: adminPassword,
    name: 'Admin User',
    role: UserRole.ADMIN,
  });
  await userRepository.save(admin);

  // Create student users
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = [];
  for (let i = 1; i <= 50; i++) {
    const student = userRepository.create({
      email: `student${i}@example.com`,
      password: studentPassword,
      name: `Student ${i}`,
      role: UserRole.STUDENT,
    });
    students.push(await userRepository.save(student));
  }

  // Create groups
  const groups = [];
  const groupNames = ['Group A', 'Group B', 'Group C', 'Group D'];
  for (const name of groupNames) {
    const group = groupRepository.create({
      name,
      description: `Students in ${name}`,
    });
    groups.push(await groupRepository.save(group));
  }

  // Create courses
  const courses = [];
  const courseData = [
    {
      name: 'Mathematics',
      description: 'Advanced mathematics course',
      isPublic: true,
      acceptingGrades: true,
    },
    {
      name: 'Physics',
      description: 'Introduction to physics',
      isPublic: true,
      acceptingGrades: true,
    },
    {
      name: 'Computer Science',
      description: 'Programming fundamentals',
      isPublic: true,
      acceptingGrades: true,
    },
    {
      name: 'History',
      description: 'World history course',
      isPublic: false,
      acceptingGrades: true,
    },
  ];

  for (const data of courseData) {
    const course = courseRepository.create(data);
    course.groups = groups; // Assign all groups to each course for simplicity
    courses.push(await courseRepository.save(course));
  }

  // Enroll students in courses
  for (const student of students) {
    // Randomly select 2-3 courses for each student
    const numCourses = Math.floor(Math.random() * 2) + 2; // 2 or 3 courses
    const shuffledCourses = [...courses].sort(() => 0.5 - Math.random());
    const selectedCourses = shuffledCourses.slice(0, numCourses);
    
    student.enrolledCourses = selectedCourses;
    await userRepository.save(student);
  }

  // Generate grades
  for (const student of students) {
    for (const course of student.enrolledCourses) {
      // Randomly assign a group from the course's groups
      const groupIndex = Math.floor(Math.random() * groups.length);
      const group = groups[groupIndex];
      
      // Generate a grade with normal-ish distribution
      // Mean around 75, std dev around 10
      let value = 75 + (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 15;
      value = Math.min(100, Math.max(0, value)); // Clamp between 0 and 100
      value = Math.round(value * 10) / 10; // Round to 1 decimal place
      
      const grade = gradeRepository.create({
        value,
        student,
        course,
        group,
      });
      
      await gradeRepository.save(grade);
    }
  }

  console.log('Database seeded successfully!');
  await app.close();
}

seed().catch(error => {
  console.error('Error seeding database:', error);
  process.exit(1);
});