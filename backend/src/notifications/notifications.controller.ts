import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/interfaces/current-user-payload.interface';
import { UserRole } from '@prisma/client';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('admin')
  @SkipThrottle()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin notifications' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async getAdminNotifications(): Promise<NotificationResponseDto[]> {
    return this.notificationsService.getAdminNotifications();
  }

  @Get('me')
  @SkipThrottle()
  @Roles(UserRole.ADMIN, UserRole.MEMBER, UserRole.TRAINER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async getMyNotifications(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.getUserNotifications(user.userId);
  }

  @Post('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create admin/broadcast notification' })
  async createAdminNotification(@Body() dto: CreateNotificationDto) {
    const roles =
      dto.targetRole === 'ALL' || !dto.targetRole
        ? [UserRole.ADMIN, UserRole.MEMBER, UserRole.TRAINER, UserRole.STAFF]
        : [dto.targetRole];
    const count = await this.notificationsService.createBroadcast({
      roles,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      actionUrl: dto.actionUrl,
    });
    return { message: 'Notifications sent', count };
  }

  @Patch(':id/read')
  @Roles(UserRole.ADMIN, UserRole.MEMBER, UserRole.TRAINER, UserRole.STAFF)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }

  @Patch('admin/read-all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark all admin notifications as read' })
  async markAllAdminRead() {
    await this.notificationsService.markAllReadForAdmin();
    return { message: 'All admin notifications marked as read' };
  }

  @Patch('me/read-all')
  @Roles(UserRole.ADMIN, UserRole.MEMBER, UserRole.TRAINER, UserRole.STAFF)
  @ApiOperation({ summary: 'Mark all current user notifications as read' })
  async markAllUserRead(@CurrentUser() user: CurrentUserPayload) {
    await this.notificationsService.markAllReadForUser(user.userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MEMBER, UserRole.TRAINER, UserRole.STAFF)
  @ApiOperation({ summary: 'Delete a notification' })
  async delete(@Param('id') id: string) {
    await this.notificationsService.delete(id);
    return { message: 'Notification deleted' };
  }
}
