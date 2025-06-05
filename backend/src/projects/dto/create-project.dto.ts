import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Taskify Web App' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Frontend + Backend + Auth', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['userId1', 'userId2'], required: false })
  @IsOptional()
  members?: string[];

  @ApiProperty({ example: 'teamId1', required: false })
  @IsOptional()
  @IsString()
  teamId?: string;
}
