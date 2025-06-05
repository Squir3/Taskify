import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from './schemas/project.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }

  async findAllForUser(userId: string, teamId?: string): Promise<Project[]> {
    if (teamId) {
      // If teamId is provided, return projects for that team
      return this.projectModel.find({ teamId }).exec();
    }
    // Otherwise, return projects where the user is a member
    return this.projectModel.find({ members: userId }).exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    return project;
  }

  async create(data: Partial<Project>): Promise<Project> {
    return this.projectModel.create(data);
  }

  async update(id: string, dto: Partial<Project>): Promise<Project> {
    const project = await this.projectModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!project) throw new Error(`Project with id ${id} not found`);
    return project;
  }

  async delete(id: string): Promise<void> {
    const project = await this.projectModel.findByIdAndDelete(id);
    if (!project) throw new Error(`Project with id ${id} not found`);
  }
}
