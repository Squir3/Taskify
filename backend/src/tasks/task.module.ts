import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Note, NoteSchema } from './schemas/note.schema';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
  ],
  providers: [TaskService, CommentService, NoteService, NotificationsGateway],
  controllers: [TaskController, CommentController, NoteController],
})
export class TaskModule {}
