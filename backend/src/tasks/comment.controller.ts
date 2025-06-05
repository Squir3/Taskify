import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './schemas/comment.schema';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('comments')
@Controller('comments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() dto: CreateCommentDto): Promise<Comment> {
    return this.commentService.create(dto);
  }

  @Get()
  async findByTask(@Query('taskId') taskId: string): Promise<Comment[]> {
    return this.commentService.findByTask(taskId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.commentService.delete(id);
    return { deleted };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { content: string },
  ): Promise<Comment | null> {
    return await this.commentService.update(id, body.content);
  }
}
