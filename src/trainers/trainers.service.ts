import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainerDto, UpdateTrainerDto, TrainerResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createTrainerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createTrainerDto.password, 10);

    // Create user and trainer in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createTrainerDto.email,
          password: hashedPassword,
          role: Role.TRAINER,
        },
      });

      const trainer = await tx.trainer.create({
        data: {
          userId: user.id,
          firstName: createTrainerDto.firstName,
          lastName: createTrainerDto.lastName,
          specializations: createTrainerDto.specializations,
          certifications: createTrainerDto.certifications || [],
        },
        include: {
          user: true,
        },
      });

      return trainer;
    });

    return this.toResponseDto(result);
  }

  async findAll(): Promise<TrainerResponseDto[]> {
    const trainers = await this.prisma.trainer.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return trainers.map((trainer) => this.toResponseDto(trainer));
  }

  async findOne(id: string): Promise<TrainerResponseDto> {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    return this.toResponseDto(trainer);
  }

  async update(
    id: string,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<TrainerResponseDto> {
    // Check if trainer exists
    const existingTrainer = await this.prisma.trainer.findUnique({
      where: { id },
    });

    if (!existingTrainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    // Update trainer
    const updatedTrainer = await this.prisma.trainer.update({
      where: { id },
      data: {
        firstName: updateTrainerDto.firstName,
        lastName: updateTrainerDto.lastName,
        specializations: updateTrainerDto.specializations,
        certifications: updateTrainerDto.certifications,
      },
      include: {
        user: true,
      },
    });

    return this.toResponseDto(updatedTrainer);
  }

  async deactivate(id: string): Promise<void> {
    // Check if trainer exists
    const existingTrainer = await this.prisma.trainer.findUnique({
      where: { id },
    });

    if (!existingTrainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.trainer.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  private toResponseDto(trainer: any): TrainerResponseDto {
    return {
      id: trainer.id,
      email: trainer.user.email,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      specializations: trainer.specializations,
      certifications: trainer.certifications,
      isActive: trainer.isActive,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
    };
  }
}
