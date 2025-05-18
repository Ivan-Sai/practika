import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsUUID, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateGradeDto } from './create-grade.dto';

export class UpdateGradeDto extends PartialType(CreateGradeDto) {
  @ApiPropertyOptional({ description: 'Grade value', example: 85.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  value?: number;

  @ApiPropertyOptional({ description: 'Group ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}