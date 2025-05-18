import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { StatisticsController } from './statistics.controller';
import { Grade } from './entities/grade.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Group } from '../groups/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grade, User, Course, Group])],
  controllers: [GradesController, StatisticsController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}