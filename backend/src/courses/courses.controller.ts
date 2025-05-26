import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all courses for authenticated users' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllForUsers() {
    return this.coursesService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public courses' })
  findPublic() {
    return this.coursesService.findPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by id' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get(':id/groups')
  @ApiOperation({ summary: 'Get all groups for a course' })
  @ApiResponse({ status: 200, description: 'Returns all groups for a course' })
  findCourseGroups(@Param('id') id: string) {
    return this.coursesService.findPublicCourseGroups(id);
  }
  
  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/groups/:groupId')
  @ApiOperation({ summary: 'Add a group to a course' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  addGroup(@Param('id') id: string, @Param('groupId') groupId: string) {
    return this.coursesService.addGroup(id, groupId);
  }

  @Delete(':id/groups/:groupId')
  @ApiOperation({ summary: 'Remove a group from a course' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  removeGroup(@Param('id') id: string, @Param('groupId') groupId: string) {
    return this.coursesService.removeGroup(id, groupId);
  }
}