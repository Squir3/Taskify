import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AppRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // bcrypt hash

  @Prop({ enum: AppRole, default: AppRole.MEMBER })
  role: AppRole;

  @Prop() // dla multi‑tenant
  organizationId: string;

  @Prop() // referencja do zespołu
  teamId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
