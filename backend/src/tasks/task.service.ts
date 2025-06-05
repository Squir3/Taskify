import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/task.schema';
import { Model } from 'mongoose';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    return task;
  }

  async create(data: Partial<Task>): Promise<Task> {
    const task = await this.taskModel.create(data);
    this.notificationsGateway.sendTaskNotification(task);
    return task;
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const updatedTask = await this.taskModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    this.notificationsGateway.sendTaskNotification(updatedTask);
    return updatedTask;
  }

  async delete(id: string): Promise<Task> {
    const deletedTask = await this.taskModel.findByIdAndDelete(id);
    if (!deletedTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    return deletedTask;
  }

  // Zwraca zadania przypisane do danego userId
  async findByAssignedTo(userId: string): Promise<Task[]> {
    return this.taskModel.find({ assignedTo: userId }).exec();
  }
}
