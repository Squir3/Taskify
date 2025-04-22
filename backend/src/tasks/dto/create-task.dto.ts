import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Fix bug in login',
    description: 'Title of the task',
  })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Occurs when submitting form', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'todo',
    enum: ['todo', 'in-progress', 'done'],
    required: false,
  })
  @IsOptional()
  @IsIn(['todo', 'in-progress', 'done'])
  status?: string;

  @ApiProperty({ example: '2025-05-01T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: '66210f41ec6b8f3a983b57c2', required: false })
  @IsOptional()
  @IsString()
  projectId?: string;
}
