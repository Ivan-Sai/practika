import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GradesService } from './grades.service';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get grade distribution for a course' })
  getCourseDistribution(@Param('courseId') courseId: string) {
    return this.gradesService.getDistribution(courseId);
  }

  @Get('courses/:courseId/groups/:groupId')
  @ApiOperation({ summary: 'Get grade distribution for a specific group in a course' })
  getGroupDistribution(
    @Param('courseId') courseId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.gradesService.getGroupDistribution(courseId, groupId);
  }

  @Get('courses/:courseId/normal-curve')
  @ApiOperation({ summary: 'Get normal distribution curve data for comparison' })
  @ApiQuery({ name: 'points', required: false, type: Number, description: 'Number of points to generate for the curve' })
  getNormalCurve(
    @Param('courseId') courseId: string,
    @Query('points') points?: number,
  ) {
    const numPoints = points ? parseInt(points as any) : 100;
    return this.gradesService.generateNormalCurve(courseId, numPoints);
  }
}