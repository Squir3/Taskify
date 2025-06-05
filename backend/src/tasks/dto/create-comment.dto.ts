import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'taskId123' })
  @IsString()
  taskId: string;

  @ApiProperty({ example: 'userId123' })
  @IsString()
  authorId: string;

  @ApiProperty({ example: 'To jest komentarz do zadania.' })
  @IsString()
  content: string;
}
