import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AppRole } from '../users/schemas/user.schema';

@ApiTags('projects')
@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(@Req() req: any): Promise<Project[]> {
    // Type-safe extraction of user fields
    let user: {
      userId?: string;
      sub?: string;
      _id?: string;
      teamId?: string;
      role?: string;
    } = {};
    // Defensive: avoid unsafe access by checking for user property
    if (req && typeof req === 'object' && req !== null) {
      const maybeUser = (req as Record<string, unknown>)['user'];
      if (maybeUser && typeof maybeUser === 'object') {
        user = maybeUser as {
          userId?: string;
          sub?: string;
          _id?: string;
          teamId?: string;
          role?: string;
        };
      }
    }
    const userId = user.userId || user.sub || user._id || '';
    const teamId = user.teamId || undefined;
    const role = user.role;
    if (role === 'admin' || role === 'manager') {
      return this.projectService.findAll();
    }
    return this.projectService.findAllForUser(userId, teamId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return this.projectService.findOne(id);
  }

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Post()
  async create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.projectService.create(dto);
  }

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProjectDto>,
  ): Promise<Project> {
    return this.projectService.update(id, dto);
  }

  @Roles(AppRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.projectService.delete(id);
  }
}
