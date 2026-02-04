import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            id: true, // Need something to select if removing everything else?
            // isActive removed
            dateOfBirth: true, // keeping valid input
          },
        },
        trainer: {
          select: {
            specialization: true,
            // isActive removed
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
      firstName: user.firstName,
      lastName: user.lastName,
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
        firstName: true,
        lastName: true,
        phone: true, // Phone is on User now
        role: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            id: true,
            dateOfBirth: true,
            // isActive removed
          },
        },
        trainer: {
          select: {
            id: true,
            specialization: true,
            certification: true, // Fixed: singular
            // isActive removed
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
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.member || user.trainer || null,
    };
  }

  async changeUserRole(
    userId: string,
    changeRoleDto: ChangeRoleDto,
    requestingUserRole: UserRole, // Updated type
  ) {
    // Only ADMIN can change roles
    if (requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can change user roles');
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

    // Prevent changing ADMIN role
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot change admin role');
    }

    // Prevent setting role to ADMIN
    if (changeRoleDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot assign admin role');
    }

    const { role } = changeRoleDto;

    // Update user role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Handle profile creation/deletion based on role change
    if (role === UserRole.MEMBER && !user.member) {
      // Create member profile if changing to MEMBER
      await this.prisma.member.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === UserRole.TRAINER && !user.trainer) {
      // Create trainer profile if changing to TRAINER
      await this.prisma.trainer.create({
        data: {
          userId: user.id,
          specialization: 'General',
          experience: 0,
          hourlyRate: 0,
        },
      });
    }

    return updatedUser;
  }

  async deleteUser(userId: string, requestingUserRole: UserRole) {
    // Only ADMIN can delete users
    if (requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can delete users');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting ADMIN
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot delete admin');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }
}
