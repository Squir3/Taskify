import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AppRole } from './schemas/user.schema';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() req: { user: { userId: string } }) {
    return this.userService.findOne(req.user.userId);
  }

  @Roles(AppRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  @Roles(AppRole.ADMIN)
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Roles(AppRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateUserDto>,
  ): Promise<User> {
    return this.userService.update(id, dto);
  }

  @Roles(AppRole.ADMIN, AppRole.MANAGER)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
