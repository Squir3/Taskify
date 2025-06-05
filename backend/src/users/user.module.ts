import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './schemas/team.schema';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamReportController } from './team-report.controller';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [TeamService, UserService],
  controllers: [TeamController, TeamReportController, UserController],
})
export class UserModule {}
