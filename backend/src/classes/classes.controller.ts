import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import {
    CreateClassDto,
    UpdateClassDto,
    BookClassDto,
    ClassResponseDto,
    ClassBookingResponseDto,
    ClassFiltersDto,
    ClassWaitlistResponseDto,
    ClassFavoriteResponseDto,
    CreateClassPackageDto,
    ClassPackageResponseDto,
    PurchaseClassPackageDto,
    MemberClassCreditsResponseDto,
    RateInstructorDto,
    InstructorProfileResponseDto,
    UpdateBookingStatusDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/interfaces/current-user-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('classes')
@ApiBearerAuth('JWT-auth')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.TRAINER)
    @ApiOperation({
        summary: 'Create a new class',
        description: 'Create a new fitness class. Requires ADMIN or TRAINER role.',
    })
    @ApiResponse({
        status: 201,
        description: 'Class successfully created',
        type: ClassResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Trainer role required',
    })
    @ApiResponse({ status: 409, description: 'Trainer schedule conflict' })
    async create(
        @Body() createClassDto: CreateClassDto,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<ClassResponseDto> {
        return this.classesService.create(createClassDto, user);
    }

    @Get()
    @Public()
    @ApiOperation({
        summary: 'Get all classes (Public)',
        description:
            'Retrieve a paginated list of classes with optional filters (date range, trainer, type). No authentication required.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of classes retrieved successfully',
    })
    async findAll(
        @Query() filters: ClassFiltersDto,
    ): Promise<PaginatedResponseDto<ClassResponseDto>> {
        return this.classesService.findAll(filters);
    }

    @Get('schedules/:id')
    @Public()
    @ApiOperation({
        summary: 'Get class by ID (Public)',
        description:
            'Retrieve detailed information about a specific class including bookings. No authentication required.',
    })
    @ApiParam({
        name: 'id',
        description: 'Class UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Class details retrieved successfully',
        type: ClassResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Class not found' })
    async findOne(@Param('id') id: string): Promise<ClassResponseDto> {
        return this.classesService.findOne(id);
    }

    @Patch('schedules/:id')
    @Roles(UserRole.ADMIN, UserRole.TRAINER)
    @ApiOperation({
        summary: 'Update class information',
        description: 'Update class details. Requires ADMIN or TRAINER role.',
    })
    @ApiParam({
        name: 'id',
        description: 'Class UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Class updated successfully',
        type: ClassResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Class not found' })
    async update(
        @Param('id') id: string,
        @Body() updateClassDto: UpdateClassDto,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<ClassResponseDto> {
        return this.classesService.update(id, updateClassDto, user);
    }

    @Delete('schedules/:id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Deactivate class',
        description:
            'Soft delete a class (sets isActive to false). Requires ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'Class UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Class deactivated successfully',
        schema: {
            example: { message: 'Class deactivated successfully' },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @ApiResponse({ status: 404, description: 'Class not found' })
    async deactivate(@Param('id') id: string): Promise<{ message: string }> {
        await this.classesService.deactivate(id);
        return { message: 'Class deactivated successfully' };
    }

    @Post('schedules/:id/book')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    @ApiOperation({
        summary: 'Book a class',
        description: 'Book a class for a member. Requires ADMIN or MEMBER role.',
    })
    @ApiParam({
        name: 'id',
        description: 'Class UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 201,
        description: 'Class booked successfully',
        type: ClassBookingResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Class is at full capacity' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Class or member not found' })
    @ApiResponse({ status: 409, description: 'Already booked' })
    async bookClass(
        @Param('id') classScheduleId: string,
        @Body() bookDto: Omit<BookClassDto, 'classScheduleId'>,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<ClassBookingResponseDto> {
        return this.classesService.bookClass(
            {
                ...bookDto,
                classScheduleId,
            } as BookClassDto,
            user,
        );
    }

    @Delete('bookings/:id')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    @ApiOperation({
        summary: 'Cancel class booking',
        description: 'Cancel a class booking. Requires ADMIN or MEMBER role.',
    })
    @ApiParam({
        name: 'id',
        description: 'Booking UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Booking cancelled successfully',
        schema: {
            example: { message: 'Booking cancelled successfully' },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    async cancelBooking(
        @Param('id') bookingId: string,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<{ message: string }> {
        await this.classesService.cancelBooking(bookingId, user);
        return { message: 'Booking cancelled successfully' };
    }

    @Patch('bookings/:id/status')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    async updateBookingStatus(
        @Param('id') bookingId: string,
        @Body() dto: UpdateBookingStatusDto,
    ): Promise<ClassBookingResponseDto> {
        return this.classesService.updateBookingStatus(bookingId, dto.status);
    }

    @Get('members/:memberId/bookings')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async getMemberBookings(
        @Param('memberId') memberId: string,
        @CurrentUser() user: CurrentUserPayload,
    ) {
        return this.classesService.getMemberBookings(memberId, user);
    }

    @Get('bookings')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    async getAllBookings(@Query('classScheduleId') classScheduleId?: string) {
        return this.classesService.getAllBookings(classScheduleId);
    }

    @Post('schedules/:id/waitlist')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async joinWaitlist(
        @Param('id') classScheduleId: string,
        @Body() dto: Omit<BookClassDto, 'classScheduleId'>,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<ClassWaitlistResponseDto> {
        return this.classesService.joinWaitlist(
            classScheduleId,
            dto.memberId,
            user,
        );
    }

    @Delete('waitlist/:id')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async leaveWaitlist(
        @Param('id') waitlistId: string,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<{ message: string }> {
        await this.classesService.leaveWaitlist(waitlistId, user);
        return { message: 'Waitlist entry cancelled successfully' };
    }

    @Get('members/:memberId/waitlist')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async getMemberWaitlist(
        @Param('memberId') memberId: string,
        @CurrentUser() user: CurrentUserPayload,
    ) {
        return this.classesService.getMemberWaitlist(memberId, user);
    }

    @Get('waitlist')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    async getAllWaitlist(@Query('classScheduleId') classScheduleId?: string) {
        return this.classesService.getAllWaitlist(classScheduleId);
    }

    @Post('schedules/:id/waitlist/promote')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    async promoteWaitlist(
        @Param('id') classScheduleId: string,
    ): Promise<{ message: string }> {
        await this.classesService.promoteNextWaitlistByAdmin(classScheduleId);
        return { message: 'Waitlist promotion attempted successfully' };
    }

    @Post('favorites/:classId')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async favoriteClass(
        @Param('classId') classId: string,
        @Body() dto: Omit<BookClassDto, 'classScheduleId'>,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<ClassFavoriteResponseDto> {
        return this.classesService.favoriteClass(classId, dto.memberId, user);
    }

    @Delete('favorites/:classId/member/:memberId')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async unfavoriteClass(
        @Param('classId') classId: string,
        @Param('memberId') memberId: string,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<{ message: string }> {
        await this.classesService.unfavoriteClass(classId, memberId, user);
        return { message: 'Favorite removed successfully' };
    }

    @Get('members/:memberId/favorites')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async getMemberFavorites(
        @Param('memberId') memberId: string,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<ClassFavoriteResponseDto[]> {
        return this.classesService.getMemberFavorites(memberId, user);
    }

    @Post('packages')
    @Roles(UserRole.ADMIN)
    async createClassPackage(
        @Body() dto: CreateClassPackageDto,
    ): Promise<ClassPackageResponseDto> {
        return this.classesService.createClassPackage(dto);
    }

    @Get('packages')
    @Public()
    async getClassPackages(): Promise<ClassPackageResponseDto[]> {
        return this.classesService.getClassPackages();
    }

    @Post('packages/:id/purchase')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async purchaseClassPackage(
        @Param('id') classPackageId: string,
        @Body() dto: PurchaseClassPackageDto,
        @CurrentUser() user: CurrentUserPayload,
    ) {
        return this.classesService.purchaseClassPackage(classPackageId, dto, user);
    }

    @Get('members/:memberId/credits')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async getMemberCredits(
        @Param('memberId') memberId: string,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<MemberClassCreditsResponseDto> {
        return this.classesService.getMemberCredits(memberId, user);
    }

    @Post('schedules/:id/rate')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    async rateInstructor(
        @Param('id') classScheduleId: string,
        @Body() dto: RateInstructorDto & { memberId: string },
        @CurrentUser() user: CurrentUserPayload,
    ) {
        return this.classesService.rateInstructor(
            classScheduleId,
            dto.memberId,
            dto,
            user,
        );
    }

    @Get('instructors/:trainerId/profile')
    @Public()
    async getInstructorProfile(
        @Param('trainerId') trainerId: string,
    ): Promise<InstructorProfileResponseDto> {
        return this.classesService.getInstructorProfile(trainerId);
    }
}
