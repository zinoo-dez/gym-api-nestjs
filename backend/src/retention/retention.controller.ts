import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  RecalculateRetentionResponseDto,
  RetentionMemberDetailDto,
  RetentionMemberFiltersDto,
  RetentionMemberResponseDto,
  RetentionOverviewDto,
  RetentionTaskFiltersDto,
  RetentionTaskResponseDto,
  UpdateRetentionTaskDto,
} from './dto';
import { RetentionService } from './retention.service';

@ApiTags('retention')
@ApiBearerAuth('JWT-auth')
@Controller('retention')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get retention risk overview',
    description: 'Returns risk distribution and open retention task counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retention overview retrieved successfully',
    type: RetentionOverviewDto,
  })
  async getOverview(): Promise<RetentionOverviewDto> {
    return this.retentionService.getOverview();
  }

  @Get('members')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get retention members',
    description: 'Returns paginated member retention risk profiles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retention members retrieved successfully',
  })
  async getMembers(
    @Query() filters: RetentionMemberFiltersDto,
  ): Promise<PaginatedResponseDto<RetentionMemberResponseDto>> {
    return this.retentionService.getMembers(filters);
  }

  @Get('members/:memberId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get retention profile by member ID',
    description: 'Returns risk details and retention tasks for one member.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member UUID',
    example: 'cm1234567890abcdefghijkl',
  })
  @ApiResponse({
    status: 200,
    description: 'Retention profile retrieved successfully',
    type: RetentionMemberDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Retention profile not found' })
  async getMemberDetail(
    @Param('memberId') memberId: string,
  ): Promise<RetentionMemberDetailDto> {
    return this.retentionService.getMemberDetail(memberId);
  }

  @Post('recalculate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Recalculate retention risk scores',
    description:
      'Recomputes retention scores for all active members and updates retention profiles.',
  })
  @ApiResponse({
    status: 201,
    description: 'Retention recalculation completed',
    type: RecalculateRetentionResponseDto,
  })
  async recalculate(): Promise<RecalculateRetentionResponseDto> {
    return this.retentionService.recalculateAll();
  }

  @Get('tasks')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get retention tasks',
    description: 'Returns paginated retention follow-up tasks with filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retention tasks retrieved successfully',
  })
  async getTasks(
    @Query() filters: RetentionTaskFiltersDto,
  ): Promise<PaginatedResponseDto<RetentionTaskResponseDto>> {
    return this.retentionService.getTasks(filters);
  }

  @Patch('tasks/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Update a retention task',
    description:
      'Update retention task status, priority, assignee, note, or due date.',
  })
  @ApiParam({
    name: 'id',
    description: 'Retention task ID',
    example: 'cm1234567890abcdefghijkl',
  })
  @ApiResponse({
    status: 200,
    description: 'Retention task updated successfully',
    type: RetentionTaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Retention task not found' })
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateRetentionTaskDto,
  ): Promise<RetentionTaskResponseDto> {
    return this.retentionService.updateTask(id, dto);
  }
}
