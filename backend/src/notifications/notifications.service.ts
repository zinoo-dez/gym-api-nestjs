import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, UserRole } from '@prisma/client';
import { NotificationResponseDto } from './dto/notification-response.dto';

/** Keys from GymSetting that control notification dispatch. */
export type NotificationSettingKey =
    | 'newMemberNotification'
    | 'newTrainerNotification'
    | 'newMembershipNotification'
    | 'newPaymentNotification'
    | 'newSessionNotification'
    | 'newWorkoutPlanNotification'
    | 'newAttendanceNotification';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Check a gym setting and send a role-based notification only if the setting is enabled.
     * Eliminates the repeated "check settings → create notification" pattern across all services.
     */
    async notifyIfEnabled(
        settingKey: NotificationSettingKey,
        params: {
            role: UserRole;
            title: string;
            message: string;
            type?: NotificationType | (string & {});
            actionUrl?: string;
        },
    ) {
        const settings = await this.prisma.gymSetting.findFirst({
            select: { [settingKey]: true },
        });
        if ((settings as Record<string, unknown>)?.[settingKey] === false) {
            return null;
        }
        return this.createForRole(params);
    }

    /**
     * Check a gym setting and send both a role-based + user-specific notification if enabled.
     */
    async notifyRoleAndUserIfEnabled(
        settingKey: NotificationSettingKey,
        roleParams: {
            role: UserRole;
            title: string;
            message: string;
            type?: NotificationType | (string & {});
            actionUrl?: string;
        },
        userParams?: {
            userId: string;
            title: string;
            message: string;
            type?: NotificationType | (string & {});
            actionUrl?: string;
        },
    ) {
        const settings = await this.prisma.gymSetting.findFirst({
            select: { [settingKey]: true },
        });
        if ((settings as Record<string, unknown>)?.[settingKey] === false) {
            return null;
        }
        const roleNotif = await this.createForRole(roleParams);
        const userNotif = userParams
            ? await this.createForUser(userParams)
            : null;
        return { roleNotif, userNotif };
    }

    async createForRole(params: {
        role: UserRole;
        title: string;
        message: string;
        type?: NotificationType | (string & {});
        actionUrl?: string;
    }) {
        try {
            return await this.prisma.notification.create({
                data: {
                    role: params.role,
                    title: params.title,
                    message: params.message,
                    type: this.normalizeType(params.type),
                    actionUrl: params.actionUrl,
                },
            });
        } catch (error) {
            this.logger.error(
                'Failed to create role notification',
                error instanceof Error ? error.stack : String(error),
            );
            return null;
        }
    }

    async createBroadcast(params: {
        roles: UserRole[];
        title: string;
        message: string;
        type?: NotificationType | (string & {});
        actionUrl?: string;
    }) {
        try {
            const type = this.normalizeType(params.type);
            const data = params.roles.map((role) => ({
                role,
                title: params.title,
                message: params.message,
                type,
                actionUrl: params.actionUrl,
            }));

            const result = await this.prisma.notification.createMany({ data });
            return result.count;
        } catch (error) {
            this.logger.error(
                'Failed to create broadcast notifications',
                error instanceof Error ? error.stack : String(error),
            );
            return 0;
        }
    }
    async createForUser(params: {
        userId: string;
        title: string;
        message: string;
        type?: NotificationType | (string & {});
        actionUrl?: string;
    }) {
        try {
            return await this.prisma.notification.create({
                data: {
                    userId: params.userId,
                    title: params.title,
                    message: params.message,
                    type: this.normalizeType(params.type),
                    actionUrl: params.actionUrl,
                },
            });
        } catch (error) {
            this.logger.error(
                'Failed to create user notification',
                error instanceof Error ? error.stack : String(error),
            );
            return null;
        }
    }

    async getAdminNotifications(): Promise<NotificationResponseDto[]> {
        const notifications = await this.prisma.notification.findMany({
            where: { role: UserRole.ADMIN },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return notifications.map(this.toResponseDto);
    }

    async getUserNotifications(
        userId: string,
    ): Promise<NotificationResponseDto[]> {
        const notifications = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return notifications.map(this.toResponseDto);
    }

    async markRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }

    async markAllReadForAdmin() {
        await this.prisma.notification.updateMany({
            where: { role: UserRole.ADMIN, read: false },
            data: { read: true },
        });
    }

    async markAllReadForUser(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }

    async delete(id: string) {
        await this.prisma.notification.delete({ where: { id } });
    }

    private toResponseDto(notification: any): NotificationResponseDto {
        return {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            read: notification.read,
            actionUrl: notification.actionUrl ?? undefined,
            role: notification.role ?? undefined,
            createdAt: notification.createdAt,
        };
    }

    private normalizeType(
        type?: NotificationType | (string & {}),
    ): NotificationType {
        if (!type) return NotificationType.IN_APP;
        const typeValue = type as string;
        if ((Object.values(NotificationType) as string[]).includes(typeValue)) {
            return type as NotificationType;
        }

        return NotificationType.IN_APP;
    }
}
