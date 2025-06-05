import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NoteService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  async create(dto: CreateNoteDto): Promise<Note> {
    return this.noteModel.create(dto);
  }

  async findByTask(
    taskId: string,
    userId: string,
    userTeamId?: string,
  ): Promise<Note[]> {
    // Zwróć notatki prywatne autora oraz notatki widoczne dla zespołu, jeśli userTeamId podany
    const query: Array<Record<string, any>> = [{ authorId: userId }];
    if (userTeamId) {
      query.push({ teamVisible: true });
    }
    return this.noteModel.find({ taskId, $or: query }).exec();
  }

  async delete(noteId: string, userId: string): Promise<void> {
    const note = await this.noteModel.findById(noteId);
    if (!note) throw new ForbiddenException('Note not found');
    if (note.authorId !== userId) throw new ForbiddenException('Not allowed');
    await this.noteModel.deleteOne({ _id: noteId });
  }

  async update(
    noteId: string,
    userId: string,
    content: string,
    teamVisible?: boolean,
  ): Promise<Note | null> {
    const note = await this.noteModel.findById(noteId);
    if (!note) throw new ForbiddenException('Note not found');
    if (note.authorId !== userId) throw new ForbiddenException('Not allowed');
    note.content = content;
    if (typeof teamVisible === 'boolean') note.teamVisible = teamVisible;
    await note.save();
    return note;
  }
}
