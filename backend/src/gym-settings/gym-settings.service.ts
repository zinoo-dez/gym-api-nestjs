import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sanitizeHtml from 'sanitize-html';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGymSettingDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class GymSettingsService {
    constructor(
        private prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
        private readonly configService: ConfigService,
    ) { }

    async getSettings() {
        const envTaxPercentage = Number(
            this.configService.get<string>('PAYMENTS_TAX_PERCENTAGE', '0'),
        );
        const defaults = {
            name: 'Your Gym',
            tagLine: 'Train smarter. Live stronger.',
            address: '',
            phone: '',
            email: '',
            logo: '',
            description:
                'Everything you need to achieve your fitness goals under one roof, backed by expert support.',
            favicon: '',
            currency: 'USD',
            taxPercentage: 0,
            stripePublicKey: '',
            stripeSecretKey: '',
            paypalClientId: '',
            paypalSecret: '',
        };

        let settings:
            | {
                id: string;
                name: string;
                tagLine: string;
                address: string;
                phone: string;
                email: string;
                logo: string;
                description: string;
                favicon: string;
                currency: string;
                taxPercentage: number;
                stripePublicKey: string;
                stripeSecretKey: string;
                paypalClientId: string;
                paypalSecret: string;
            }
            | null = null;

        try {
            settings = await this.prisma.gymSetting.findFirst({
                select: {
                    id: true,
                    name: true,
                    tagLine: true,
                    address: true,
                    phone: true,
                    email: true,
                    logo: true,
                    description: true,
                    favicon: true,
                    currency: true,
                    taxPercentage: true,
                    stripePublicKey: true,
                    stripeSecretKey: true,
                    paypalClientId: true,
                    paypalSecret: true,
                },
            });
        } catch (error) {
            if (this.isMissingDbObjectError(error)) {
                return defaults;
            }
            throw error;
        }

        if (!settings) {
            // Create settings with environment-driven defaults to avoid hardcoded values
            try {
                return await this.prisma.gymSetting.create({
                    data: {
                        name: this.configService.get('GYM_NAME', defaults.name),
                        tagLine: this.configService.get('GYM_TAGLINE', defaults.tagLine),
                        address: this.configService.get('GYM_ADDRESS', defaults.address),
                        phone: this.configService.get('GYM_PHONE', defaults.phone),
                        email: this.configService.get('GYM_EMAIL', defaults.email),
                        logo: this.configService.get('GYM_LOGO', defaults.logo),
                        description: this.configService.get(
                            'GYM_DESCRIPTION',
                            defaults.description,
                        ),
                        favicon: this.configService.get('GYM_FAVICON', defaults.favicon),
                        currency: this.configService.get(
                            'PAYMENTS_CURRENCY',
                            defaults.currency,
                        ),
                        taxPercentage: Number.isFinite(envTaxPercentage)
                            ? envTaxPercentage
                            : defaults.taxPercentage,
                        stripePublicKey: this.configService.get(
                            'STRIPE_PUBLIC_KEY',
                            defaults.stripePublicKey,
                        ),
                        stripeSecretKey: this.configService.get(
                            'STRIPE_SECRET_KEY',
                            defaults.stripeSecretKey,
                        ),
                        paypalClientId: this.configService.get(
                            'PAYPAL_CLIENT_ID',
                            defaults.paypalClientId,
                        ),
                        paypalSecret: this.configService.get(
                            'PAYPAL_SECRET',
                            defaults.paypalSecret,
                        ),
                    },
                });
            } catch (error) {
                if (this.isMissingDbObjectError(error)) {
                    return defaults;
                }
                throw error;
            }
        }

        return {
            ...settings,
            name: settings?.name || defaults.name,
            tagLine: settings?.tagLine || defaults.tagLine,
            description: settings?.description || defaults.description,
            currency: settings?.currency || defaults.currency,
            taxPercentage: settings?.taxPercentage ?? defaults.taxPercentage,
            stripePublicKey: settings?.stripePublicKey || defaults.stripePublicKey,
            stripeSecretKey: settings?.stripeSecretKey || defaults.stripeSecretKey,
            paypalClientId: settings?.paypalClientId || defaults.paypalClientId,
            paypalSecret: settings?.paypalSecret || defaults.paypalSecret,
        };
    }

    async updateSettings(dto: UpdateGymSettingDto) {
        const settings = await this.prisma.gymSetting.findFirst();

        if (!settings) {
            throw new NotFoundException('Gym settings not found');
        }

        const sanitizeContent = (value?: string) => {
            if (value === undefined) return value;
            return sanitizeHtml(value, {
                allowedTags: [
                    'p',
                    'br',
                    'strong',
                    'em',
                    'u',
                    'a',
                    'ul',
                    'ol',
                    'li',
                    'img',
                    'span',
                    'div',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'blockquote',
                ],
                allowedAttributes: {
                    a: ['href', 'target', 'rel'],
                    img: ['src', 'alt'],
                    span: ['style'],
                    div: ['style'],
                },
                allowedSchemes: ['http', 'https', 'data'],
                allowProtocolRelative: false,
            });
        };

        const sanitizedDto: UpdateGymSettingDto = {
            ...dto,
            description: sanitizeContent(dto.description),
        };

        const updated = await this.prisma.gymSetting.update({
            where: { id: settings.id },
            data: sanitizedDto,
        });

        if (settings.newGymSettingNotification !== false) {
            await this.notificationsService.createForRole({
                role: UserRole.ADMIN,
                title: 'Gym settings updated',
                message: 'Gym settings were updated.',
                type: 'info',
                actionUrl: '/admin/settings',
            });
        }

        return updated;
    }

    private isMissingDbObjectError(error: unknown): boolean {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            (error.code === 'P2021' || error.code === 'P2022')
        );
    }
}
