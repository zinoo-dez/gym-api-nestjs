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
import { ClassesService } from './classes.service';
import {
  CreateClassDto,
  UpdateClassDto,
  BookClassDto,
  ClassResponseDto,
  ClassBookingResponseDto,
  ClassFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../members/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TRAINER)
  async create(
    @Body() createClassDto: CreateClassDto,
  ): Promise<ClassResponseDto> {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async findAll(
    @Query() filters: ClassFiltersDto,
  ): Promise<PaginatedResponseDto<ClassResponseDto>> {
    return this.classesService.findAll(filters);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async findOne(@Param('id') id: string): Promise<ClassResponseDto> {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
  async update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<ClassResponseDto> {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deactivate(@Param('id') id: string): Promise<{ message: string }> {
    await this.classesService.deactivate(id);
    return { message: 'Class deactivated successfully' };
  }

  @Post(':id/book')
  @Roles(Role.ADMIN, Role.MEMBER)
  async bookClass(
    @Param('id') classId: string,
    @Body() bookDto: Omit<BookClassDto, 'classId'>,
  ): Promise<ClassBookingResponseDto> {
    return this.classesService.bookClass({
      ...bookDto,
      classId,
    } as BookClassDto);
  }

  @Delete('bookings/:id')
  @Roles(Role.ADMIN, Role.MEMBER)
  async cancelBooking(
    @Param('id') bookingId: string,
  ): Promise<{ message: string }> {
    await this.classesService.cancelBooking(bookingId);
    return { message: 'Booking cancelled successfully' };
  }
}
