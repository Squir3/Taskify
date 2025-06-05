import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../tasks/schemas/task.schema';
import { Team } from './schemas/team.schema';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AppRole } from './schemas/user.schema';

@ApiTags('teams')
@Controller('teams')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TeamReportController {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
  ) {}

  // Liczba ukończonych zadań dla zespołu
  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Get(':id/report')
  async getTeamReport(@Param('id') teamId: string) {
    const total = await this.taskModel.countDocuments({ teamId });
    const completed = await this.taskModel.countDocuments({
      teamId,
      status: 'done',
    });
    const inProgress = await this.taskModel.countDocuments({
      teamId,
      status: 'in-progress',
    });
    const todo = await this.taskModel.countDocuments({
      teamId,
      status: 'todo',
    });
    return {
      teamId,
      total,
      completed,
      inProgress,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  // Raport aktywności użytkowników w zespole
  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Get(':id/user-activity')
  async getTeamUserActivity(@Param('id') teamId: string) {
    // Pobierz zespół i jego członków
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new Error('Team not found');
    // Zlicz ukończone zadania dla każdego członka
    const stats = await Promise.all(
      team.members.map(async (userId: string) => {
        const completed = await this.taskModel.countDocuments({
          teamId,
          assignedTo: userId,
          status: 'done',
        });
        const inProgress = await this.taskModel.countDocuments({
          teamId,
          assignedTo: userId,
          status: 'in-progress',
        });
        const todo = await this.taskModel.countDocuments({
          teamId,
          assignedTo: userId,
          status: 'todo',
        });
        return { userId, completed, inProgress, todo };
      }),
    );
    return {
      teamId,
      userStats: stats,
    };
  }
}
