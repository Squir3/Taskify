/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 'todo' }) // todo | in-progress | done
  status: string;

  @Prop({ default: 'medium' }) // low | medium | high
  priority: string;

  @Prop()
  dueDate: Date;

  @Prop()
  projectId: string;

  @Prop({ type: String }) // userId
  assignedTo: string;

  @Prop({ type: String }) // teamId
  teamId: string;

  // Komentarze będą osobnym modelem, relacja po taskId
}

export const TaskSchema = SchemaFactory.createForClass(Task);
