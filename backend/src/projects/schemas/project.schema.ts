/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] }) // userIds
  members: string[];

  @Prop({ type: String, required: false }) // teamId
  teamId?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
