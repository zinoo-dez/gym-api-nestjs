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
import { WorkoutPlansService } from './workout-plans.service';
import {
    CreateWorkoutPlanDto,
    UpdateWorkoutPlanDto,
    WorkoutPlanResponseDto,
    WorkoutPlanVersionResponseDto,
    WorkoutPlanFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/interfaces/current-user-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('workout-plans')
@ApiBearerAuth('JWT-auth')
@Controller('workout-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutPlansController {
    constructor(private readonly workoutPlansService: WorkoutPlansService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.TRAINER)
    @ApiOperation({
        summary: 'Create a workout plan',
        description:
            'Create a new workout plan with exercises. Requires ADMIN or TRAINER role.',
    })
    @ApiResponse({
        status: 201,
        description: 'Workout plan successfully created',
        type: WorkoutPlanResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Trainer role required',
    })
    @ApiResponse({ status: 404, description: 'Member or trainer not found' })
    async create(
        @Body() createWorkoutPlanDto: CreateWorkoutPlanDto,
        @CurrentUser() user: CurrentUserPayload,
    ): Promise<WorkoutPlanResponseDto> {
        return this.workoutPlansService.create(createWorkoutPlanDto, user.id);
    }

    @Get()
    @Public()
    @ApiOperation({
        summary: 'Get all workout plans (Public)',
        description:
            'Retrieve a paginated list of all workout plans with optional filters. No authentication required.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of workout plans retrieved successfully',
    })
    async findAll(
        @Query() filters: WorkoutPlanFiltersDto,
    ): Promise<PaginatedResponseDto<WorkoutPlanResponseDto>> {
        return this.workoutPlansService.findAll(filters);
    }

    @Get('member/:memberId')
    @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
    @ApiOperation({
        summary: 'Get workout plans by member',
        description: 'Retrieve all workout plans assigned to a specific member.',
    })
    @ApiParam({
        name: 'memberId',
        description: 'Member UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Member workout plans retrieved successfully',
        type: [WorkoutPlanResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Member not found' })
    async findByMember(
        @Param('memberId') memberId: string,
    ): Promise<WorkoutPlanResponseDto[]> {
        return this.workoutPlansService.findByMember(memberId);
    }

    @Get(':id')
    @Public()
    @ApiOperation({
        summary: 'Get workout plan by ID (Public)',
        description:
            'Retrieve detailed information about a specific workout plan including exercises. No authentication required.',
    })
    @ApiParam({
        name: 'id',
        description: 'Workout plan UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Workout plan details retrieved successfully',
        type: WorkoutPlanResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Workout plan not found' })
    async findOne(@Param('id') id: string): Promise<WorkoutPlanResponseDto> {
        return this.workoutPlansService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.TRAINER)
    @ApiOperation({
        summary: 'Update workout plan',
        description:
            'Update workout plan details. Version history is preserved. Requires ADMIN or TRAINER role.',
    })
    @ApiParam({
        name: 'id',
        description: 'Workout plan UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Workout plan updated successfully',
        type: WorkoutPlanResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Trainer role required',
    })
    @ApiResponse({ status: 404, description: 'Workout plan not found' })
    async update(
        @Param('id') id: string,
        @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto,
    ): Promise<WorkoutPlanResponseDto> {
        return this.workoutPlansService.update(id, updateWorkoutPlanDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.TRAINER)
    @ApiOperation({
        summary: 'Deactivate workout plan',
        description:
            'Soft delete a workout plan (sets isActive to false). Requires ADMIN or TRAINER role.',
    })
    @ApiParam({
        name: 'id',
        description: 'Workout plan UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Workout plan deactivated successfully',
        schema: {
            example: { message: 'Workout plan deactivated successfully' },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Trainer role required',
    })
    @ApiResponse({ status: 404, description: 'Workout plan not found' })
    async deactivate(@Param('id') id: string): Promise<{ message: string }> {
        await this.workoutPlansService.deactivate(id);
        return { message: 'Workout plan deactivated successfully' };
    }

    @Get(':id/versions')
    @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
    @ApiOperation({
        summary: 'Get workout plan version history',
        description: 'Retrieve all versions of a workout plan.',
    })
    @ApiParam({
        name: 'id',
        description: 'Workout plan UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Version history retrieved successfully',
        type: [WorkoutPlanVersionResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Workout plan not found' })
    async getVersionHistory(
        @Param('id') id: string,
    ): Promise<WorkoutPlanVersionResponseDto[]> {
        return this.workoutPlansService.getVersionHistory(id);
    }

    @Get(':id/versions/:version')
    @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER)
    @ApiOperation({
        summary: 'Get specific workout plan version',
        description: 'Retrieve a specific version of a workout plan.',
    })
    @ApiParam({
        name: 'id',
        description: 'Workout plan UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'version',
        description: 'Version number',
        example: '1',
    })
    @ApiResponse({
        status: 200,
        description: 'Workout plan version retrieved successfully',
        type: WorkoutPlanVersionResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 404,
        description: 'Workout plan or version not found',
    })
    async getVersion(
        @Param('id') id: string,
        @Param('version') version: string,
    ): Promise<WorkoutPlanVersionResponseDto> {
        return this.workoutPlansService.getVersion(id, parseInt(version, 10));
    }
}
