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
import type { CurrentUserPayload } from '../common/interfaces/current-user-payload.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CreateTrainerSessionDto,
  CreateUserProgressDto,
  TrainerSessionFiltersDto,
} from './dto';
import { TrainerSessionsService } from './trainer-sessions.service';

@ApiTags('trainer-sessions')
@ApiBearerAuth('JWT-auth')
@Controller('trainer-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainerSessionsController {
  constructor(
    private readonly trainerSessionsService: TrainerSessionsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF)
  @ApiOperation({ summary: 'Book a trainer session' })
  async createSession(
    @Body() dto: CreateTrainerSessionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trainerSessionsService.createSession(dto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'List trainer sessions' })
  async listSessions(
    @Query() filters: TrainerSessionFiltersDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trainerSessionsService.listSessions(filters, user);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF)
  @ApiOperation({ summary: 'Mark trainer session complete' })
  async completeSession(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.trainerSessionsService.completeSession(id, user);
  }

  @Post(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF)
  @ApiOperation({ summary: 'Record progress for a trainer session' })
  async recordProgress(
    @Param('id') id: string,
    @Body() dto: CreateUserProgressDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trainerSessionsService.recordProgress(id, dto, user);
  }

  @Get('member/:memberId/progress')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get member progress history' })
  async getMemberProgress(
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trainerSessionsService.getMemberProgress(memberId, user);
  }

  @Get('bookable-members')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get members available for session booking' })
  async getBookableMembers() {
    return this.trainerSessionsService.getBookableMembers();
  }

  @Get('me/progress')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get current member progress history' })
  async getMyProgress(@CurrentUser() user: CurrentUserPayload) {
    return this.trainerSessionsService.getMyProgress(user);
  }
}
