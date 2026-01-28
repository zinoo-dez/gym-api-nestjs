import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  CheckInDto,
  AttendanceResponseDto,
  AttendanceReportDto,
  AttendanceFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaginatedResponseDto } from '../members/dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async checkIn(
    @Body() checkInDto: CheckInDto,
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.checkIn(checkInDto);
  }

  @Post(':id/check-out')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async checkOut(@Param('id') id: string): Promise<AttendanceResponseDto> {
    return this.attendanceService.checkOut(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TRAINER)
  async findAll(
    @Query() filters: AttendanceFiltersDto,
  ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
    return this.attendanceService.findAll(filters);
  }

  @Get('report/:memberId')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
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
