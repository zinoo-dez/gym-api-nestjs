import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberResponseDto,
  MemberFiltersDto,
  PaginatedResponseDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto): Promise<MemberResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createMemberDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);

    // Create user and member in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createMemberDto.email,
          password: hashedPassword,
          role: Role.MEMBER,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          firstName: createMemberDto.firstName,
          lastName: createMemberDto.lastName,
          phone: createMemberDto.phone,
          dateOfBirth: createMemberDto.dateOfBirth
            ? new Date(createMemberDto.dateOfBirth)
            : undefined,
        },
        include: {
          user: true,
        },
      });

      return member;
    });

    return this.toResponseDto(result);
  }

  async findAll(
    filters?: MemberFiltersDto,
    currentUser?: any,
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = filters?.skip || 0;

    // Build where clause based on filters
    const where: Prisma.MemberWhereInput = {};

    // If trainer, only show assigned members
    if (currentUser?.role === Role.TRAINER) {
      const trainer = await this.prisma.trainer.findUnique({
        where: { userId: currentUser.userId },
        select: { id: true },
      });

      if (trainer) {
        where.workoutPlans = {
          some: {
            trainerId: trainer.id,
          },
        };
      }
    }

    // Filter by name (search in firstName or lastName)
    if (filters?.name) {
      where.OR = [
        { firstName: { contains: filters.name, mode: 'insensitive' } },
        { lastName: { contains: filters.name, mode: 'insensitive' } },
      ];
    }

    // Filter by email
    if (filters?.email) {
      where.user = {
        email: { contains: filters.email, mode: 'insensitive' },
      };
    }

    // Filter by membership status or type
    if (filters?.status || filters?.membershipType) {
      const membershipWhere: Prisma.MembershipWhereInput = {};

      if (filters.status) {
        membershipWhere.status = filters.status;
      }

      if (filters.membershipType) {
        membershipWhere.plan = {
          type: filters.membershipType,
        };
      }

      where.memberships = {
        some: membershipWhere,
      };
    }

    // Get total count
    const total = await this.prisma.member.count({ where });

    // Get paginated members
    const members = await this.prisma.member.findMany({
      where,
      include: {
        user: true,
        memberships: {
          include: {
            plan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const memberDtos = members.map((member) => this.toResponseDto(member));

    return new PaginatedResponseDto(memberDtos, page, limit, total);
  }

  async findOne(id: string, currentUser?: any): Promise<MemberResponseDto> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Authorization check
    if (currentUser) {
      // Members can only access their own record
      if (
        currentUser.role === Role.MEMBER &&
        member.userId !== currentUser.userId
      ) {
        throw new ForbiddenException(
          'You can only access your own member record',
        );
      }

      // Trainers can only access assigned members
      if (currentUser.role === Role.TRAINER) {
        const trainer = await this.prisma.trainer.findUnique({
          where: { userId: currentUser.userId },
          select: { id: true },
        });

        if (trainer) {
          const isAssigned = await this.prisma.workoutPlan.findFirst({
            where: {
              memberId: id,
              trainerId: trainer.id,
            },
            select: { id: true },
          });

          if (!isAssigned) {
            throw new ForbiddenException(
              'You can only access members assigned to you',
            );
          }
        }
      }
    }

    return this.toResponseDto(member);
  }

  async update(
    id: string,
    updateMemberDto: UpdateMemberDto,
    currentUser?: any,
  ): Promise<MemberResponseDto> {
    // Check if member exists - only select id field
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Authorization check - Members can only update their own record
    if (
      currentUser?.role === Role.MEMBER &&
      existingMember.userId !== currentUser.userId
    ) {
      throw new ForbiddenException(
        'You can only update your own member record',
      );
    }

    // Update member
    const updatedMember = await this.prisma.member.update({
      where: { id },
      data: {
        firstName: updateMemberDto.firstName,
        lastName: updateMemberDto.lastName,
        phone: updateMemberDto.phone,
        dateOfBirth: updateMemberDto.dateOfBirth
          ? new Date(updateMemberDto.dateOfBirth)
          : undefined,
      },
      include: {
        user: true,
      },
    });

    return this.toResponseDto(updatedMember);
  }

  async deactivate(id: string): Promise<void> {
    // Check if member exists - only select id field
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.member.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async hasActiveMembership(memberId: string): Promise<boolean> {
    const activeMembership = await this.prisma.membership.findFirst({
      where: {
        memberId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    return !!activeMembership;
  }

  async getBookings(memberId: string, currentUser?: any): Promise<any[]> {
    // Check if member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Authorization check - Members can only access their own bookings
    if (
      currentUser?.role === Role.MEMBER &&
      member.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only access your own bookings');
    }

    // Get all bookings for the member - use select to avoid over-fetching
    const bookings = await this.prisma.classBooking.findMany({
      where: {
        memberId,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            schedule: true,
            duration: true,
            capacity: true,
            classType: true,
            trainer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      class: {
        id: booking.class.id,
        name: booking.class.name,
        description: booking.class.description,
        schedule: booking.class.schedule,
        duration: booking.class.duration,
        capacity: booking.class.capacity,
        classType: booking.class.classType,
        trainer: {
          id: booking.class.trainer.id,
          firstName: booking.class.trainer.firstName,
          lastName: booking.class.trainer.lastName,
        },
      },
    }));
  }

  private toResponseDto(member: any): MemberResponseDto {
    return {
      id: member.id,
      email: member.user.email,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}
