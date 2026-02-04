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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { WorkoutPlansService } from '../workout-plans/workout-plans.service';
import { WorkoutPlanResponseDto } from '../workout-plans/dto';

@ApiTags('members')
@ApiBearerAuth('JWT-auth')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly workoutPlansService: WorkoutPlansService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new member',
    description: 'Create a new gym member account. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Member successfully created',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<MemberResponseDto> {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({
    summary: 'Get all members',
    description:
      'Retrieve a paginated list of members with optional filters. Requires ADMIN or TRAINER role.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of members retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Trainer role required',
  })
  async findAll(
    @Query() filters: MemberFiltersDto,
    @CurrentUser() user: any,
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    return this.membersService.findAll(filters, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Get member by ID',
    description: 'Retrieve detailed information about a specific member.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Member details retrieved successfully',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<MemberResponseDto> {
    return this.membersService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Update member information',
    description:
      'Update member profile information. Requires ADMIN or MEMBER role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Member updated successfully',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @CurrentUser() user: any,
  ): Promise<MemberResponseDto> {
    return this.membersService.update(id, updateMemberDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Deactivate member',
    description:
      'Soft delete a member account (sets isActive to false). Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Member deactivated successfully',
    schema: {
      example: { message: 'Member deactivated successfully' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async deactivate(@Param('id') id: string): Promise<{ message: string }> {
    await this.membersService.deactivate(id);
    return { message: 'Member deactivated successfully' };
  }

  @Get(':id/bookings')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Get member bookings',
    description: 'Retrieve all class bookings for a specific member.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Member bookings retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getBookings(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<any[]> {
    return this.membersService.getBookings(id, user);
  }

  @Get(':id/workout-plans')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Get member workout plans',
    description: 'Retrieve all workout plans assigned to a specific member.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Member workout plans retrieved successfully',
    type: [WorkoutPlanResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getWorkoutPlans(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<WorkoutPlanResponseDto[]> {
    return this.workoutPlansService.findByMember(id, user);
  }
}
