import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'taskId123' })
  @IsString()
  taskId: string;

  @ApiProperty({ example: 'userId123' })
  @IsString()
  authorId: string;

  @ApiProperty({ example: 'To jest prywatna notatka.' })
  @IsString()
  content: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  teamVisible?: boolean;
}
