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
  Res,
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
  SubscribeMembershipDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';

@ApiTags('memberships')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // Membership Plan endpoints

  @Post('membership-plans')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
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
  @Public()
  @ApiOperation({
    summary: 'Get all membership plans (Public)',
    description:
      'Retrieve a paginated list of all available membership plans with optional filters. No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of membership plans retrieved successfully',
  })
  async findAllPlans(
    @Query() filters: MembershipPlanFiltersDto,
  ): Promise<PaginatedResponseDto<MembershipPlanResponseDto>> {
    return this.membershipsService.findAllPlans(filters);
  }

  @Get('membership-plans/:id')
  @Public()
  @ApiOperation({
    summary: 'Get membership plan by ID (Public)',
    description:
      'Retrieve detailed information about a specific membership plan. No authentication required.',
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
  @ApiResponse({ status: 404, description: 'Membership plan not found' })
  async findPlanById(
    @Param('id') id: string,
  ): Promise<MembershipPlanResponseDto> {
    return this.membershipsService.findPlanById(id);
  }

  @Patch('membership-plans/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
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

  @Delete('membership-plans/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete membership plan',
    description: 'Delete a membership plan. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Membership plan UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Membership plan deleted successfully',
    schema: {
      example: { message: 'Membership plan deleted successfully' },
    },
  })
  @ApiResponse({ status: 400, description: 'Plan has active subscriptions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Membership plan not found' })
  async deletePlan(@Param('id') id: string): Promise<{ message: string }> {
    await this.membershipsService.deletePlan(id);
    return { message: 'Membership plan deleted successfully' };
  }

  // Membership assignment endpoints

  @Post('memberships')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
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

  @Post('memberships/subscribe')
  @Roles(UserRole.MEMBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Subscribe to a membership plan',
    description:
      'Allows a member to subscribe to a membership plan. Requires MEMBER role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully subscribed to membership plan',
    type: MembershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Already has active membership' })
  async subscribeMembership(
    @Body() subscribeDto: SubscribeMembershipDto,
    @CurrentUser() user: any,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.subscribeMembership(
      user.userId,
      subscribeDto,
    );
  }

  @Get('memberships/discount-preview')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Preview discount pricing for a plan',
    description: 'Validate a discount code and return pricing preview.',
  })
  @ApiResponse({ status: 200, description: 'Discount preview returned' })
  async previewDiscount(
    @Query('planId') planId: string,
    @Query('code') code: string,
  ) {
    return this.membershipsService.previewDiscount(planId, code);
  }

  @Get('memberships/:id')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiBearerAuth('JWT-auth')
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
    @CurrentUser() user: any,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.findMembershipById(id, user);
  }

  @Get('memberships/:id/invoice')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Download membership invoice (PDF)',
    description: 'Download a PDF invoice for a membership.',
  })
  @ApiParam({
    name: 'id',
    description: 'Membership UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'PDF invoice file' })
  async downloadInvoice(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const { filename, buffer } =
      await this.membershipsService.generateInvoicePdf(id, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Post('memberships/:memberId/upgrade')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiBearerAuth('JWT-auth')
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
    @CurrentUser() user: any,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.upgradeMembership(
      memberId,
      upgradeDto,
      user,
    );
  }

  @Post('memberships/:id/freeze')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Freeze a membership',
    description: 'Freeze a member subscription. Requires ADMIN role.',
  })
  async freezeMembership(@Param('id') id: string) {
    return this.membershipsService.freezeMembership(id);
  }

  @Post('memberships/:id/unfreeze')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unfreeze a membership',
    description: 'Unfreeze a member subscription. Requires ADMIN role.',
  })
  async unfreezeMembership(@Param('id') id: string) {
    return this.membershipsService.unfreezeMembership(id);
  }

  @Post('memberships/:id/cancel')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cancel a membership',
    description: 'Cancel a member subscription. Requires ADMIN role.',
  })
  async cancelMembership(@Param('id') id: string) {
    return this.membershipsService.cancelMembership(id);
  }
}
