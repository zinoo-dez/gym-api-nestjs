import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto, MemberResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

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

  async findAll(): Promise<MemberResponseDto[]> {
    const members = await this.prisma.member.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return members.map((member) => this.toResponseDto(member));
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
