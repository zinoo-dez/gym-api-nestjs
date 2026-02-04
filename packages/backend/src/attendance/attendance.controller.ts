import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MembersService } from '../members/members.service';
import {
  CheckInDto,
  AttendanceResponseDto,
  AttendanceReportDto,
  AttendanceFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PaginatedResponseDto } from '../members/dto';

@ApiTags('attendance')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly membersService: MembersService,
  ) {}

  @Post('check-in')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Check in member',
    description: 'Record a member check-in for gym visit or class attendance.',
  })
  @ApiResponse({
    status: 201,
    description: 'Check-in recorded successfully',
    type: AttendanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Member has no active membership' })
  @ApiResponse({ status: 404, description: 'Member or class not found' })
  async checkIn(
    @Body() checkInDto: CheckInDto,
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.checkIn(checkInDto);
  }

  @Post(':id/check-out')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Check out member',
    description: 'Record a member check-out.',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance record UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Check-out recorded successfully',
    type: AttendanceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async checkOut(@Param('id') id: string): Promise<AttendanceResponseDto> {
    return this.attendanceService.checkOut(id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Get all attendance records',
    description:
      'Retrieve a paginated list of attendance records with optional filters. Requires ADMIN, TRAINER, or MEMBER role.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attendance records retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Trainer role required',
  })
  async findAll(
    @Query() filters: AttendanceFiltersDto,
    @CurrentUser() user: any,
  ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
    let effectiveFilters = filters;

    if (user?.role === UserRole.MEMBER) {
      const member = await this.membersService.findByUserId(user.userId);
      if (!effectiveFilters) {
        effectiveFilters = new AttendanceFiltersDto();
      }
      effectiveFilters.memberId = member.id;
    }
    return this.attendanceService.findAll(effectiveFilters);
  }

  @Get('report/:memberId')
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Generate attendance report',
    description:
      'Generate an attendance report for a member within a date range.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (ISO 8601 format). Defaults to 30 days ago.',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (ISO 8601 format). Defaults to today.',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance report generated successfully',
    type: AttendanceReportDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async generateReport(
    @Param('memberId') memberId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AttendanceReportDto> {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.attendanceService.generateReport(memberId, start, end);
  }
}
