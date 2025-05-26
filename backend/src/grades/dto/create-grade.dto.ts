import { IsNotEmpty, IsNumber, IsUUID, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({ description: 'Grade value', example: 85.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;

  @ApiProperty({ description: 'Student ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ description: 'Course ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({ description: 'Group ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}