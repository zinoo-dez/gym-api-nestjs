import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CreateProgressGoalDto,
  CreateProgressMilestoneDto,
  CreateProgressPhotoDto,
  PhotoComparisonQueryDto,
  ProgressGoalFiltersDto,
  ProgressMilestoneFiltersDto,
  ProgressPhotoFiltersDto,
  RecordBodyCompositionDto,
  ReportQueryDto,
  TimelineFiltersDto,
  UpdateProgressGoalDto,
} from './dto';
import { BodyCompositionService } from './body-composition.service';

@ApiTags('body-composition')
@ApiBearerAuth('JWT-auth')
@Controller('body-composition')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BodyCompositionController {
  constructor(private readonly bodyCompositionService: BodyCompositionService) {}

  @Post('measurements')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Record body composition measurements' })
  async recordMeasurement(
    @Body() dto: RecordBodyCompositionDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.recordMeasurement(dto, user);
  }

  @Get('me/measurements')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get my body composition timeline' })
  async getMyMeasurements(
    @Query() filters: TimelineFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getMeasurements(user.memberId, filters, user);
  }

  @Get('member/:memberId/measurements')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get body composition timeline for a member' })
  async getMemberMeasurements(
    @Param('memberId') memberId: string,
    @Query() filters: TimelineFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getMeasurements(memberId, filters, user);
  }

  @Post('photos')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Create a progress photo record' })
  async createPhoto(@Body() dto: CreateProgressPhotoDto, @CurrentUser() user: any) {
    return this.bodyCompositionService.createPhoto(dto, user);
  }

  @Get('me/photos')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get my progress photo timeline' })
  async getMyPhotos(
    @Query() filters: ProgressPhotoFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getPhotos(user.memberId, filters, user);
  }

  @Get('member/:memberId/photos')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get member progress photo timeline' })
  async getMemberPhotos(
    @Param('memberId') memberId: string,
    @Query() filters: ProgressPhotoFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getPhotos(memberId, filters, user);
  }

  @Get('me/photos/comparison')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get my side-by-side photo comparison' })
  async getMyPhotoComparison(
    @Query() query: PhotoComparisonQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.comparePhotos(user.memberId, query, user);
  }

  @Get('member/:memberId/photos/comparison')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get side-by-side photo comparison for a member' })
  async getMemberPhotoComparison(
    @Param('memberId') memberId: string,
    @Query() query: PhotoComparisonQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.comparePhotos(memberId, query, user);
  }

  @Post('goals')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Create a progress goal' })
  async createGoal(@Body() dto: CreateProgressGoalDto, @CurrentUser() user: any) {
    return this.bodyCompositionService.createGoal(dto, user);
  }

  @Get('me/goals')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get my progress goals' })
  async getMyGoals(
    @Query() filters: ProgressGoalFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getGoals(user.memberId, filters, user);
  }

  @Get('member/:memberId/goals')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get progress goals for a member' })
  async getMemberGoals(
    @Param('memberId') memberId: string,
    @Query() filters: ProgressGoalFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getGoals(memberId, filters, user);
  }

  @Patch('goals/:goalId')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Update goal progress and status' })
  async updateGoal(
    @Param('goalId') goalId: string,
    @Body() dto: UpdateProgressGoalDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.updateGoal(goalId, dto, user);
  }

  @Post('milestones')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Create a progress milestone' })
  async createMilestone(
    @Body() dto: CreateProgressMilestoneDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.createMilestone(dto, user);
  }

  @Get('me/milestones')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get my milestones' })
  async getMyMilestones(
    @Query() filters: ProgressMilestoneFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getMilestones(user.memberId, filters, user);
  }

  @Get('member/:memberId/milestones')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get milestones for a member' })
  async getMemberMilestones(
    @Param('memberId') memberId: string,
    @Query() filters: ProgressMilestoneFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getMilestones(memberId, filters, user);
  }

  @Post('milestones/:id/share')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Generate share token for a milestone' })
  async shareMilestone(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bodyCompositionService.shareMilestone(id, user);
  }

  @Get('share/:shareToken')
  @Public()
  @ApiOperation({ summary: 'View a shared milestone publicly' })
  async getSharedMilestone(@Param('shareToken') shareToken: string) {
    return this.bodyCompositionService.getSharedMilestone(shareToken);
  }

  @Get('me/dashboard')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get my visual progress dashboard data' })
  async getMyDashboard(
    @Query() query: ReportQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getDashboard(user.memberId, query, user);
  }

  @Get('member/:memberId/dashboard')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get visual progress dashboard data for a member' })
  async getMemberDashboard(
    @Param('memberId') memberId: string,
    @Query() query: ReportQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getDashboard(memberId, query, user);
  }

  @Get('me/report')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get my structured progress report' })
  async getMyReport(@Query() query: ReportQueryDto, @CurrentUser() user: any) {
    return this.bodyCompositionService.getReport(user.memberId, query, user);
  }

  @Get('member/:memberId/report')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get structured progress report for a member' })
  async getMemberReport(
    @Param('memberId') memberId: string,
    @Query() query: ReportQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.bodyCompositionService.getReport(memberId, query, user);
  }
}
