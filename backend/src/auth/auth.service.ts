import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, ChangePasswordDto, ForgotPasswordDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserResponse } from './interfaces/user-response.interface';
import { UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; user: UserResponse }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        avatarUrl: registerDto.avatarUrl ?? '',
        role: registerDto.role,
      },
    });

    // Create associated profile based on role
    // Create associated profile based on role
    if (registerDto.role === UserRole.MEMBER) {
      await this.prisma.member.create({
        data: {
          userId: user.id,
        },
      });
      const settings = await this.prisma.gymSetting.findFirst({
        select: { newMemberNotification: true },
      });
      if (settings?.newMemberNotification !== false) {
        await this.notificationsService.createForRole({
          role: UserRole.ADMIN,
          title: 'New member registered',
          message: `${user.firstName} ${user.lastName} (${user.email}) joined.`,
          type: 'success',
          actionUrl: '/admin/members',
        });
      }
    } else if (registerDto.role === UserRole.TRAINER) {
      await this.prisma.trainer.create({
        data: {
          userId: user.id,
          specialization: 'General', // Default value as it is required string
          experience: 0, // Default value
          hourlyRate: 0, // Default value
        },
      });
      const settings = await this.prisma.gymSetting.findFirst({
        select: { newTrainerNotification: true },
      });
      if (settings?.newTrainerNotification !== false) {
        await this.notificationsService.createForRole({
          role: UserRole.ADMIN,
          title: 'New trainer registered',
          message: `${user.firstName} ${user.lastName} (${user.email}) joined as a trainer.`,
          type: 'success',
          actionUrl: '/admin/trainers',
        });
      }
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
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
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

    const isValid = await this.comparePasswords(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    // Always return success to avoid account enumeration.
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    // TODO: integrate email provider + token generation.
    return { message: 'If the email exists, a reset link has been sent.' };
  }
}
