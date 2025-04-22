import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/task.schema';
import { Model } from 'mongoose';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

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
    return this.taskModel.create(data);
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const updatedTask = await this.taskModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    return updatedTask;
  }

  async delete(id: string): Promise<Task> {
    const deletedTask = await this.taskModel.findByIdAndDelete(id);
    if (!deletedTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    return deletedTask;
  }
}
