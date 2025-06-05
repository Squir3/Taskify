import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Team extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] }) // userIds
  members: string[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
