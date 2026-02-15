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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MarketingAutomationType, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginatedResponseDto } from '../common/dto';
import {
  CampaignFiltersDto,
  CreateCampaignDto,
  CreateMarketingAutomationDto,
  CreateMarketingTemplateDto,
  LogCampaignEventDto,
  MarketingAnalyticsResponseDto,
  UpdateCampaignDto,
  UpdateMarketingAutomationDto,
  UpdateMarketingTemplateDto,
} from './dto';
import { MarketingService } from './marketing.service';

@ApiTags('marketing')
@ApiBearerAuth('JWT-auth')
@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'List marketing templates' })
  async listTemplates() {
    return this.marketingService.listTemplates();
  }

  @Post('templates')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a marketing template' })
  async createTemplate(@Body() dto: CreateMarketingTemplateDto) {
    return this.marketingService.createTemplate(dto);
  }

  @Patch('templates/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update a marketing template' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateMarketingTemplateDto,
  ) {
    return this.marketingService.updateTemplate(id, dto);
  }

  @Post('campaigns')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create campaign draft/scheduled campaign' })
  async createCampaign(
    @Body() dto: CreateCampaignDto,
    @CurrentUser() user: any,
  ) {
    return this.marketingService.createCampaign(dto, user?.id);
  }

  @Get('campaigns')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'List campaigns with filters' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async listCampaigns(
    @Query() filters: CampaignFiltersDto,
  ): Promise<PaginatedResponseDto<any>> {
    return this.marketingService.listCampaigns(filters);
  }

  @Get('campaigns/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get campaign detail with recipients' })
  async getCampaign(@Param('id') id: string) {
    return this.marketingService.getCampaign(id);
  }

  @Patch('campaigns/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update campaign' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.marketingService.updateCampaign(id, dto);
  }

  @Post('campaigns/:id/send')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Send campaign immediately',
    description:
      'Supports bulk email/SMS/in-app dispatch for members and class promotion audiences.',
  })
  async sendCampaign(@Param('id') id: string) {
    return this.marketingService.sendCampaign(id);
  }

  @Post('campaigns/:id/recipients/:recipientId/events')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Log campaign engagement event (open/click/fail)' })
  async logCampaignEvent(
    @Param('id') id: string,
    @Param('recipientId') recipientId: string,
    @Body() dto: LogCampaignEventDto,
  ) {
    return this.marketingService.logCampaignEvent(id, recipientId, dto);
  }

  @Get('campaigns/:id/analytics')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get campaign analytics (open/click rates)' })
  @ApiResponse({ status: 200, type: MarketingAnalyticsResponseDto })
  async getCampaignAnalytics(
    @Param('id') id: string,
  ): Promise<MarketingAnalyticsResponseDto> {
    return this.marketingService.getCampaignAnalytics(id);
  }

  @Get('automations')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'List marketing automations' })
  async listAutomations() {
    return this.marketingService.listAutomations();
  }

  @Post('automations')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create marketing automation config',
    description:
      'Configure birthday wishes, re-engagement, class promotion, or newsletter automation.',
  })
  async createAutomation(@Body() dto: CreateMarketingAutomationDto) {
    return this.marketingService.createAutomation(dto);
  }

  @Patch('automations/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update marketing automation config' })
  async updateAutomation(
    @Param('id') id: string,
    @Body() dto: UpdateMarketingAutomationDto,
  ) {
    return this.marketingService.updateAutomation(id, dto);
  }

  @Post('automations/run')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Run active automations now',
    description:
      'Optionally provide automation type query to run one type only.',
  })
  @ApiQuery({ name: 'type', enum: MarketingAutomationType, required: false })
  async runAutomations(@Query('type') type?: MarketingAutomationType) {
    return this.marketingService.runAutomations(type);
  }

  @Post('automations/run/:type')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Run one automation type now' })
  @ApiParam({ name: 'type', enum: MarketingAutomationType })
  async runAutomationByType(@Param('type') type: MarketingAutomationType) {
    return this.marketingService.runAutomations(type);
  }
}
