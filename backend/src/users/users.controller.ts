import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user\'s profile' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    const userId = req.user.id;
    return this.usersService.findOne(userId);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get current user\'s enrolled courses' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserCourses(@Request() req) {
    const userId = req.user.id;
    const user = await this.usersService.findOne(userId);
    return user.enrolledCourses || [];
  }

  @Delete('courses/:courseId')
  @ApiOperation({ summary: 'Remove a course from current user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeUserCourse(@Request() req, @Param('courseId') courseId: string) {
    const userId = req.user.id;
    return this.usersService.removeCourse(userId, courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/courses/:courseId')
  @ApiOperation({ summary: 'Add a course to a user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.usersService.addCourse(id, courseId);
  }

  @Delete(':id/courses/:courseId')
  @ApiOperation({ summary: 'Remove a course from a user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removeCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.usersService.removeCourse(id, courseId);
  }
}