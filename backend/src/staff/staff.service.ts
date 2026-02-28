import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateStaffDto,
    UpdateStaffDto,
    StaffResponseDto,
    StaffFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { UserCreationService } from '../common/services/user-creation.service';

@Injectable()
export class StaffService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userCreationService: UserCreationService,
    ) { }

    async create(createStaffDto: CreateStaffDto): Promise<StaffResponseDto> {
        const { user, profile: staff } =
            await this.userCreationService.createUserWithProfile(
                {
                    email: createStaffDto.email,
                    password: createStaffDto.password,
                    firstName: createStaffDto.firstName,
                    lastName: createStaffDto.lastName,
                    role: UserRole.STAFF,
                    status: UserStatus.ACTIVE,
                    phone: createStaffDto.phone,
                    address: createStaffDto.address,
                    avatarUrl: createStaffDto.avatarUrl,
                },
                async (tx, userId) => {
                    return tx.staff.create({
                        data: {
                            userId,
                            staffRole: createStaffDto.staffRole,
                            employeeId: createStaffDto.employeeId,
                            hireDate: new Date(createStaffDto.hireDate),
                            department: createStaffDto.department,
                            position: createStaffDto.position,
                            emergencyContact: createStaffDto.emergencyContact,
                            address: createStaffDto.address,
                        },
                        include: { user: true },
                    });
                },
            );

        const result = { ...staff, user };

        return this.toResponseDto(result);
    }

    async findAll(
        filters?: StaffFiltersDto,
    ): Promise<PaginatedResponseDto<StaffResponseDto>> {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.StaffWhereInput = {};

        if (filters?.department) {
            where.department = {
                contains: filters.department,
                mode: 'insensitive',
            };
        }

        if (filters?.staffRole) {
            where.staffRole = filters.staffRole;
        }

        if (filters?.name) {
            where.user = {
                OR: [
                    { firstName: { contains: filters.name, mode: 'insensitive' } },
                    { lastName: { contains: filters.name, mode: 'insensitive' } },
                ],
            };
        }

        if (filters?.email) {
            const prevUserWhere = where.user as Prisma.UserWhereInput | undefined;
            const emailWhere: Prisma.UserWhereInput = {
                email: { contains: filters.email, mode: 'insensitive' },
            };
            where.user = prevUserWhere
                ? { AND: [prevUserWhere, emailWhere] }
                : emailWhere;
        }

        if (filters?.isActive !== undefined) {
            const statusWhere: Prisma.UserWhereInput = {
                status: filters.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
            };
            const prevUserWhere = where.user as Prisma.UserWhereInput | undefined;
            where.user = prevUserWhere
                ? { AND: [prevUserWhere, statusWhere] }
                : statusWhere;
        }

        const total = await this.prisma.staff.count({ where });

        const staff = await this.prisma.staff.findMany({
            where,
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const staffDtos = staff.map((item) => this.toResponseDto(item));
        return new PaginatedResponseDto(staffDtos, page, limit, total);
    }

    async findOne(id: string): Promise<StaffResponseDto> {
        const staff = await this.prisma.staff.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!staff) {
            throw new NotFoundException(`Staff with ID ${id} not found`);
        }

        return this.toResponseDto(staff);
    }

    async update(
        id: string,
        updateStaffDto: UpdateStaffDto,
    ): Promise<StaffResponseDto> {
        const existing = await this.prisma.staff.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            throw new NotFoundException(`Staff with ID ${id} not found`);
        }

        const updated = await this.prisma.staff.update({
            where: { id },
            data: {
                staffRole: updateStaffDto.staffRole,
                employeeId: updateStaffDto.employeeId,
                hireDate: updateStaffDto.hireDate
                    ? new Date(updateStaffDto.hireDate)
                    : undefined,
                department: updateStaffDto.department,
                position: updateStaffDto.position,
                emergencyContact: updateStaffDto.emergencyContact,
                address: updateStaffDto.address,
                user: {
                    update: {
                        firstName: updateStaffDto.firstName,
                        lastName: updateStaffDto.lastName,
                        phone: updateStaffDto.phone,
                        address: updateStaffDto.address,
                        avatarUrl: updateStaffDto.avatarUrl,
                    },
                },
            },
            include: { user: true },
        });

        return this.toResponseDto(updated);
    }

    async deactivate(id: string): Promise<void> {
        const existing = await this.prisma.staff.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            throw new NotFoundException(`Staff with ID ${id} not found`);
        }

        await this.prisma.staff.update({
            where: { id },
            data: {
                user: {
                    update: {
                        status: UserStatus.INACTIVE,
                    },
                },
            },
        });
    }

    private toResponseDto(staff: any): StaffResponseDto {
        return {
            id: staff.id,
            email: staff.user.email,
            firstName: staff.user.firstName,
            lastName: staff.user.lastName,
            phone: staff.user.phone,
            address: staff.user.address,
            avatarUrl: staff.user.avatarUrl,
            staffRole: staff.staffRole,
            employeeId: staff.employeeId,
            hireDate: staff.hireDate,
            department: staff.department,
            position: staff.position,
            emergencyContact: staff.emergencyContact,
            isActive: staff.user?.status === UserStatus.ACTIVE,
            createdAt: staff.createdAt,
            updatedAt: staff.updatedAt,
        };
    }
}
