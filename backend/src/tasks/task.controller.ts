import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AppRole } from '../users/schemas/user.schema';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get('me')
  async findMine(@Req() req: { user?: { userId?: string } }): Promise<any> {
    const userId = req.user?.userId ?? null;
    if (!userId) return [];
    return await this.taskService.findByAssignedTo(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.taskService.findOne(id);
  }

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Post()
  async create(@Body() dto: CreateTaskDto): Promise<Task> {
    const taskData = {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    };
    return this.taskService.create(taskData);
  }

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    const updatedData = {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    };
    return this.taskService.update(id, updatedData);
  }

  @Roles(AppRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Task> {
    return this.taskService.delete(id);
  }
}
