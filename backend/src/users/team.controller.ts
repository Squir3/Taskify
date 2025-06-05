import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { Team } from './schemas/team.schema';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AppRole } from './schemas/user.schema';

@ApiTags('teams')
@Controller('teams')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Post()
  async create(
    @Body() body: { name: string; members?: string[] },
  ): Promise<Team> {
    return this.teamService.create(body.name, body.members);
  }

  @Get()
  async findAll(): Promise<Team[]> {
    return this.teamService.findAll();
  }

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Team> {
    return await this.teamService.findOne(id);
  }

  @Roles(AppRole.ADMIN)
  @Patch(':id/add-member')
  async addMember(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ): Promise<Team> {
    return this.teamService.addMember(id, body.userId);
  }

  @Roles(AppRole.ADMIN)
  @Patch(':id/remove-member')
  async removeMember(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ): Promise<Team> {
    return this.teamService.removeMember(id, body.userId);
  }

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<Team>,
  ): Promise<Team> {
    return await this.teamService.update(id, dto);
  }

  @Roles(AppRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.teamService.delete(id);
  }
}
