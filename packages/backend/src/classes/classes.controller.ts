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
} from './dto';
import { PaginatedResponseDto } from '../members/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('classes')
@ApiBearerAuth('JWT-auth')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TRAINER)
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
  ): Promise<ClassResponseDto> {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all classes',
    description:
      'Retrieve a paginated list of classes with optional filters (date range, trainer, type).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of classes retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() filters: ClassFiltersDto,
  ): Promise<PaginatedResponseDto<ClassResponseDto>> {
    return this.classesService.findAll(filters);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  @ApiOperation({
    summary: 'Get class by ID',
    description:
      'Retrieve detailed information about a specific class including bookings.',
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async findOne(@Param('id') id: string): Promise<ClassResponseDto> {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
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
  ): Promise<ClassResponseDto> {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
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

  @Post(':id/book')
  @Roles(Role.ADMIN, Role.MEMBER)
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
  ): Promise<{ message: string }> {
    await this.classesService.cancelBooking(bookingId);
    return { message: 'Booking cancelled successfully' };
  }
}
