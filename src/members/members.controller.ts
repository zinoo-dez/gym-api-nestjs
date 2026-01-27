import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MembersService } from './members.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberResponseDto,
  MemberFiltersDto,
  PaginatedResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<MemberResponseDto> {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TRAINER)
  async findAll(
    @Query() filters: MemberFiltersDto,
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    return this.membersService.findAll(filters);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async findOne(@Param('id') id: string): Promise<MemberResponseDto> {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deactivate(@Param('id') id: string): Promise<{ message: string }> {
    await this.membersService.deactivate(id);
    return { message: 'Member deactivated successfully' };
  }

  @Get(':id/bookings')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async getBookings(@Param('id') id: string): Promise<any[]> {
    return this.membersService.getBookings(id);
  }
}
