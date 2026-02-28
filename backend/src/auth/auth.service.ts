import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
    LoginDto,
    RegisterDto,
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
} from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserResponse } from './interfaces/user-response.interface';
import { NotificationType, UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { UserCreationService } from '../common/services/user-creation.service';

interface PasswordResetTokenPayload {
    sub: string;
    email: string;
    typ: 'password_reset';
    pwdChangedAt: number;
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private notificationsService: NotificationsService,
        private configService: ConfigService,
        private userCreationService: UserCreationService,
    ) { }

    async register(
        registerDto: RegisterDto,
    ): Promise<{ accessToken: string; user: UserResponse }> {
        // Ensure email is unique
        await this.userCreationService.ensureEmailUnique(registerDto.email);

        // Hash password
        const hashedPassword = await this.userCreationService.hashPassword(
            registerDto.password,
        );

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                address: registerDto.address ?? '',
                avatarUrl: registerDto.avatarUrl ?? '',
                role: registerDto.role,
            },
        });

        // Create associated profile based on role
        if (registerDto.role === UserRole.MEMBER) {
            await this.prisma.member.create({
                data: {
                    userId: user.id,
                },
            });
            await this.notificationsService.notifyIfEnabled(
                'newMemberNotification',
                {
                    role: UserRole.ADMIN,
                    title: 'New member registered',
                    message: `${user.firstName} ${user.lastName} (${user.email}) joined.`,
                    type: 'success',
                    actionUrl: '/admin/members',
                },
            );
        } else if (registerDto.role === UserRole.TRAINER) {
            await this.prisma.trainer.create({
                data: {
                    userId: user.id,
                    specialization: 'General',
                    experience: 0,
                    hourlyRate: 0,
                },
            });
            await this.notificationsService.notifyIfEnabled(
                'newTrainerNotification',
                {
                    role: UserRole.ADMIN,
                    title: 'New trainer registered',
                    message: `${user.firstName} ${user.lastName} (${user.email}) joined as a trainer.`,
                    type: 'success',
                    actionUrl: '/admin/trainers',
                },
            );
        }

        // Generate JWT token
        const accessToken = this.generateToken(user);

        return {
            accessToken,
            user: this.sanitizeUser(user),
        };
    }

    async login(
        loginDto: LoginDto,
    ): Promise<{ accessToken: string; user: UserResponse }> {
        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await this.comparePasswords(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const accessToken = this.generateToken(user);

        return {
            accessToken,
            user: this.sanitizeUser(user),
        };
    }

    async hashPassword(password: string): Promise<string> {
        return this.userCreationService.hashPassword(password);
    }

    async comparePasswords(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return this.userCreationService.comparePasswords(password, hashedPassword);
    }

    private generateToken(user: {
        id: string;
        email: string;
        role: UserRole;
    }): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }

    private sanitizeUser(user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        address?: string | null;
        avatarUrl?: string | null;
        role: UserRole; // Using UserRole enum from schema
        createdAt: Date;
        updatedAt: Date;
    }): UserResponse {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address || undefined,
            avatarUrl: user.avatarUrl || undefined,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async validateToken(token: string): Promise<JwtPayload> {
        try {
            return this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isValid = await this.comparePasswords(
            dto.currentPassword,
            user.password,
        );
        if (!isValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const hashedPassword = await this.hashPassword(dto.newPassword);

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: 'Password updated successfully' };
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                updatedAt: true,
                firstName: true,
            },
        });

        // Always return success to avoid account enumeration.
        if (!user) {
            return { message: 'If the email exists, a reset link has been sent.' };
        }

        const payload: PasswordResetTokenPayload = {
            sub: user.id,
            email: user.email,
            typ: 'password_reset',
            pwdChangedAt: user.updatedAt.getTime(),
        };
        const resetTokenExpiresIn =
            this.configService.get<string>('PASSWORD_RESET_TOKEN_EXPIRES_IN') ||
            '15m';
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: resetTokenExpiresIn as any,
        });

        const frontendUrl =
            this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
        const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

        await this.notificationsService.createForUser({
            userId: user.id,
            title: 'Password reset requested',
            message:
                'Use the link sent to your email to reset your password. If this was not you, ignore this message.',
            type: NotificationType.IN_APP,
            actionUrl: '/login',
        });
        // Fallback until SMTP/provider is integrated.
        console.info(`[Auth] Password reset link for ${user.email}: ${resetLink}`);

        return { message: 'If the email exists, a reset link has been sent.' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        let payload: PasswordResetTokenPayload;
        try {
            payload = this.jwtService.verify<PasswordResetTokenPayload>(dto.token);
        } catch {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        if (payload.typ !== 'password_reset') {
            throw new UnauthorizedException('Invalid reset token');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, updatedAt: true },
        });

        if (!user || user.email !== payload.email) {
            throw new UnauthorizedException('Invalid reset token');
        }

        if (user.updatedAt.getTime() !== payload.pwdChangedAt) {
            throw new UnauthorizedException('Reset token is no longer valid');
        }

        const hashedPassword = await this.hashPassword(dto.newPassword);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return { message: 'Password reset successfully' };
    }
}
