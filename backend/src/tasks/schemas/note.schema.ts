import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  teamVisible: boolean; // true = widoczne dla zespołu, false = tylko dla autora
}

export const NoteSchema = SchemaFactory.createForClass(Note);
