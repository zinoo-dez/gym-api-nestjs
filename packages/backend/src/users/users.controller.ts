import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ChangeRoleDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async getUserById(@Param('id') id: string, @CurrentUser() user: any) {
    // Members and Trainers can only access their own user record
    if (
      (user.role === Role.MEMBER || user.role === Role.TRAINER) &&
      user.userId !== id
    ) {
      throw new ForbiddenException('You can only access your own user record');
    }
    return this.usersService.getUserById(id);
  }

  @Patch(':id/role')
  @Roles(Role.SUPERADMIN)
  async changeUserRole(
    @Param('id') id: string,
    @Body() changeRoleDto: ChangeRoleDto,
    @Request() req: any,
  ) {
    return this.usersService.changeUserRole(id, changeRoleDto, req.user.role);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    return this.usersService.deleteUser(id, req.user.role);
  }
}
