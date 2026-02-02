import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
          },
        },
        trainer: {
          select: {
            firstName: true,
            lastName: true,
            specializations: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.member || user.trainer || null,
    }));
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            isActive: true,
          },
        },
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specializations: true,
            certifications: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.member || user.trainer || null,
    };
  }

  async changeUserRole(
    userId: string,
    changeRoleDto: ChangeRoleDto,
    requestingUserRole: Role,
  ) {
    // Only SUPERADMIN can change roles
    if (requestingUserRole !== Role.SUPERADMIN) {
      throw new ForbiddenException('Only superadmin can change user roles');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: true,
        trainer: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent changing SUPERADMIN role
    if (user.role === Role.SUPERADMIN) {
      throw new ForbiddenException('Cannot change superadmin role');
    }

    // Prevent setting role to SUPERADMIN
    if (changeRoleDto.role === Role.SUPERADMIN) {
      throw new ForbiddenException('Cannot assign superadmin role');
    }

    const { role } = changeRoleDto;

    // Update user role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Handle profile creation/deletion based on role change
    if (role === Role.MEMBER && !user.member) {
      // Create member profile if changing to MEMBER
      await this.prisma.member.create({
        data: {
          userId: user.id,
          firstName: user.trainer?.firstName || 'New',
          lastName: user.trainer?.lastName || 'Member',
        },
      });
    } else if (role === Role.TRAINER && !user.trainer) {
      // Create trainer profile if changing to TRAINER
      await this.prisma.trainer.create({
        data: {
          userId: user.id,
          firstName: user.member?.firstName || 'New',
          lastName: user.member?.lastName || 'Trainer',
          specializations: [],
          certifications: [],
        },
      });
    }

    return updatedUser;
  }

  async deleteUser(userId: string, requestingUserRole: Role) {
    // Only SUPERADMIN can delete users
    if (requestingUserRole !== Role.SUPERADMIN) {
      throw new ForbiddenException('Only superadmin can delete users');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting SUPERADMIN
    if (user.role === Role.SUPERADMIN) {
      throw new ForbiddenException('Cannot delete superadmin');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }
}
