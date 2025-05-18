import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('public-courses')
@Controller('public-courses')
export class PublicCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all public courses' })
  findPublic() {
    return this.coursesService.findPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a public course by id' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findPublicCourse(id);
  }

  @Get(':id/groups')
  @ApiOperation({ summary: 'Get all groups for a public course' })
  findGroups(@Param('id') id: string) {
    return this.coursesService.findPublicCourseGroups(id);
  }
}