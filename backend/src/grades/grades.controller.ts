import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('grades')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grade' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grades' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll() {
    return this.gradesService.findAll();
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all grades for a course' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findByCourse(@Param('courseId') courseId: string) {
    return this.gradesService.findByCourse(courseId);
  }

  @Get('course/:courseId/distribution')
  @ApiOperation({ summary: 'Get grade distribution for a course' })
  getDistribution(@Param('courseId') courseId: string) {
    return this.gradesService.getDistribution(courseId);
  }

  @Get('course/:courseId/group/:groupId/distribution')
  @ApiOperation({ summary: 'Get grade distribution for a course and group' })
  getGroupDistribution(
    @Param('courseId') courseId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.gradesService.getGroupDistribution(courseId, groupId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all grades for the current user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyGrades(@Request() req) {
    return this.gradesService.findByStudent(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a grade by id' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a grade' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a grade' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Request() req) {
    return this.gradesService.remove(id, req.user);
  }
}