import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Delete,
  Param,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './schemas/note.schema';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    teamId?: string;
    // add other properties if needed
  };
}

@ApiTags('notes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  async create(
    @Body() dto: CreateNoteDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Note> {
    // Wymuś authorId na podstawie tokena
    return this.noteService.create({ ...dto, authorId: req.user.userId });
  }

  @Get()
  async findByTask(
    @Query('taskId') taskId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Note[]> {
    // Pobierz userId i teamId z tokena
    return this.noteService.findByTask(
      taskId,
      req.user.userId,
      req.user.teamId,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.noteService.delete(id, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { content: string; teamVisible?: boolean },
    @Req() req: AuthenticatedRequest,
  ): Promise<Note | null> {
    return this.noteService.update(
      id,
      req.user.userId,
      body.content,
      body.teamVisible,
    );
  }
}
