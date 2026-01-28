import {
  Injectable,
  NotFoundException,
  ConflictException,
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
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = filters?.skip || 0;

    // Build where clause based on filters
    const where: Prisma.MemberWhereInput = {};

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

  async findOne(id: string): Promise<MemberResponseDto> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return this.toResponseDto(member);
  }

  async update(
    id: string,
    updateMemberDto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    // Check if member exists
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
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
    // Check if member exists
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
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
    });

    return !!activeMembership;
  }

  async getBookings(memberId: string): Promise<any[]> {
    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Get all bookings for the member
    const bookings = await this.prisma.classBooking.findMany({
      where: {
        memberId,
      },
      include: {
        class: {
          include: {
            trainer: true,
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
