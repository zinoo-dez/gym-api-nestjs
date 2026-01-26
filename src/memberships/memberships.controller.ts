import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import {
  CreateMembershipPlanDto,
  AssignMembershipDto,
  UpdateMembershipPlanDto,
  MembershipPlanResponseDto,
  MembershipResponseDto,
  UpgradeMembershipDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // Membership Plan endpoints

  @Post('membership-plans')
  @Roles(Role.ADMIN)
  async createPlan(
    @Body() createPlanDto: CreateMembershipPlanDto,
  ): Promise<MembershipPlanResponseDto> {
    return this.membershipsService.createPlan(createPlanDto);
  }

  @Get('membership-plans')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async findAllPlans(): Promise<MembershipPlanResponseDto[]> {
    return this.membershipsService.findAllPlans();
  }

  @Get('membership-plans/:id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async findPlanById(
    @Param('id') id: string,
  ): Promise<MembershipPlanResponseDto> {
    return this.membershipsService.findPlanById(id);
  }

  @Patch('membership-plans/:id')
  @Roles(Role.ADMIN)
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdateMembershipPlanDto,
  ): Promise<MembershipPlanResponseDto> {
    return this.membershipsService.updatePlan(id, updatePlanDto);
  }

  // Membership assignment endpoints

  @Post('memberships')
  @Roles(Role.ADMIN)
  async assignMembership(
    @Body() assignDto: AssignMembershipDto,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.assignMembership(assignDto);
  }

  @Get('memberships/:id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async findMembershipById(
    @Param('id') id: string,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.findMembershipById(id);
  }

  @Post('memberships/:memberId/upgrade')
  @Roles(Role.ADMIN, Role.MEMBER)
  async upgradeMembership(
    @Param('memberId') memberId: string,
    @Body() upgradeDto: UpgradeMembershipDto,
  ): Promise<MembershipResponseDto> {
    return this.membershipsService.upgradeMembership(memberId, upgradeDto);
  }
}
