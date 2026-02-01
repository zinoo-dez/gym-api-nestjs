import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { MembershipsService } from './memberships.service';
import {
  CreateMembershipPlanDto,
  AssignMembershipDto,
  UpdateMembershipPlanDto,
  MembershipPlanResponseDto,
  MembershipResponseDto,
  UpgradeMembershipDto,
  MembershipPlanFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('memberships')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // Membership Plan endpoints

  @Post('membership-plans')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a membership plan',
    description: 'Create a new membership plan. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Membership plan successfully created',
    type: MembershipPlanResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  async createPlan(
    @Body() createPlanDto: CreateMembershipPlanDto,
  ): Promise<MembershipPlanResponseDto> {
    return this.membershipsService.createPlan(createPlanDto);
  }

  @Get('membership-plans')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all membership plans',
    description:
      'Retrieve a paginated list of all available membership plans with optional filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of membership plans retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllPlans(
    @Query() filters: MembershipPlanFiltersDto,
  ): Promise<PaginatedResponseDto<MembershipPlanResponseDto>> {
    return this.membershipsService.findAllPlans(filters);
  }

  @Get('membership-plans/:id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  @ApiOperation({
    summary: 'Get membership plan by ID',
    description:
      'Retrieve detailed information about a specific membership plan.',
  })
  @ApiParam({
    name: 'id',
    description: 'Membership plan UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Membership plan details retrieved successfully',
    type: MembershipPlanResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Membership plan not found' })
  async findPlanById(
    @Param('id') id: string,
  ): Promise<MembershipPlanResponseDto> {
    return this.membershipsService.findPlanById(id);
  }

  @Patch('membership-plans/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update membership plan',
    description: 'Update membership plan details. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Membership plan UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Membership plan updated successfully',
    type: MembershipPlanResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Membership plan not found' })
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdateMembershipPlanDto,
  ): Promise<MembershipPlanResponseDto> {
    return this.membershipsService.updatePlan(id, updatePlanDto);
  }

  // Membership assignment endpoints

  @Post('memberships')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Assign membership to member',
    description: 'Assign a membership plan to a member. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Membership successfully assigned',
    type: MembershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Member or plan not found' })
  async assignMembership(
    @Body() assignDto: AssignMembershipDto,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.assignMembership(assignDto);
  }

  @Get('memberships/:id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  @ApiOperation({
    summary: 'Get membership by ID',
    description: 'Retrieve detailed information about a specific membership.',
  })
  @ApiParam({
    name: 'id',
    description: 'Membership UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Membership details retrieved successfully',
    type: MembershipResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  async findMembershipById(
    @Param('id') id: string,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.findMembershipById(id);
  }

  @Post('memberships/:memberId/upgrade')
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Upgrade membership',
    description:
      "Upgrade a member's membership to a new plan. Requires ADMIN or MEMBER role.",
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Membership upgraded successfully',
    type: MembershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member or plan not found' })
  async upgradeMembership(
    @Param('memberId') memberId: string,
    @Body() upgradeDto: UpgradeMembershipDto,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.upgradeMembership(memberId, upgradeDto);
  }
}
