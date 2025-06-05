import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(dto: CreateCommentDto): Promise<Comment> {
    const comment = await this.commentModel.create(dto);
    this.notificationsGateway.sendCommentNotification(comment);
    return comment;
  }

  async findByTask(taskId: string): Promise<Comment[]> {
    return this.commentModel.find({ taskId }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.commentModel.findByIdAndDelete(id);
    return !!result;
  }

  async update(id: string, content: string): Promise<Comment | null> {
    const comment = await this.commentModel.findByIdAndUpdate(
      id,
      { content },
      { new: true },
    );
    return comment;
  }
}
