import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from './schemas/team.schema';

@Injectable()
export class TeamService {
  constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

  async create(name: string, members: string[] = []): Promise<Team> {
    return this.teamModel.create({ name, members });
  }

  async findAll(): Promise<Team[]> {
    return this.teamModel.find().exec();
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel.findById(id).exec();
    if (!team) throw new Error('Team not found');
    return team;
  }

  async addMember(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findByIdAndUpdate(
      teamId,
      { $addToSet: { members: userId } },
      { new: true },
    );
    if (!team) throw new Error('Team not found');
    return team;
  }

  async removeMember(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findByIdAndUpdate(
      teamId,
      { $pull: { members: userId } },
      { new: true },
    );
    if (!team) throw new Error('Team not found');
    return team;
  }

  async update(id: string, dto: Partial<Team>): Promise<Team> {
    const team = await this.teamModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!team) throw new Error('Team not found');
    return team;
  }

  async delete(id: string): Promise<void> {
    const team = await this.teamModel.findByIdAndDelete(id);
    if (!team) throw new Error('Team not found');
  }
}
