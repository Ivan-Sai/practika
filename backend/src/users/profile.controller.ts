import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get enrolled courses for current user' })
  async getEnrolledCourses(@Request() req) {
    const user = await this.usersService.findOne(req.user.id);
    return user.enrolledCourses;
  }

  @Post('courses/:courseId')
  @ApiOperation({ summary: 'Enroll in a course' })
  enrollCourse(@Request() req, @Param('courseId') courseId: string) {
    return this.usersService.addCourse(req.user.id, courseId);
  }

  @Delete('courses/:courseId')
  @ApiOperation({ summary: 'Unenroll from a course' })
  unenrollCourse(@Request() req, @Param('courseId') courseId: string) {
    return this.usersService.removeCourse(req.user.id, courseId);
  }
}