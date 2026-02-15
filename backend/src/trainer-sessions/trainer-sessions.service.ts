import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionStatus, UserRole, UserStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTrainerSessionDto,
  CreateUserProgressDto,
  TrainerSessionFiltersDto,
} from './dto';

@Injectable()
export class TrainerSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createSession(
    dto: CreateTrainerSessionDto,
    currentUser: { userId: string; role: UserRole },
  ) {
    let trainerId = dto.trainerId;

    if (currentUser.role === UserRole.TRAINER) {
      const trainer = await this.prisma.trainer.findUnique({
        where: { userId: currentUser.userId },
        select: { id: true },
      });
      if (!trainer) {
        throw new NotFoundException('Trainer profile not found');
      }
      trainerId = trainer.id;
    }

    if (!trainerId) {
      throw new BadRequestException('trainerId is required');
    }

    const [member, trainer] = await Promise.all([
      this.prisma.member.findUnique({
        where: { id: dto.memberId },
        include: { user: true },
      }),
      this.prisma.trainer.findUnique({
        where: { id: trainerId },
        include: { user: true },
      }),
    ]);

    if (!member) throw new NotFoundException('Member not found');
    if (!trainer) throw new NotFoundException('Trainer not found');

    const session = await this.prisma.trainerSession.create({
      data: {
        memberId: member.id,
        trainerId: trainer.id,
        sessionDate: new Date(dto.sessionDate),
        duration: dto.duration,
        title: dto.title,
        description: dto.description,
        notes: dto.notes,
        rate: dto.rate,
        status: dto.status ?? SessionStatus.SCHEDULED,
      },
      include: {
        member: { include: { user: true } },
        trainer: { include: { user: true } },
      },
    });

    await this.notificationsService.createForUser({
      userId: member.userId,
      title: 'Trainer session booked',
      message: `Session scheduled with ${trainer.user.firstName} ${trainer.user.lastName}.`,
      type: 'info',
      actionUrl: '/member',
    });

    return session;
  }

  async listSessions(
    filters: TrainerSessionFiltersDto,
    currentUser: { userId: string; role: UserRole },
  ) {
    const where: any = {};
    if (filters.memberId) where.memberId = filters.memberId;
    if (filters.trainerId) where.trainerId = filters.trainerId;
    if (filters.status) where.status = filters.status;
    if (filters.upcomingOnly) {
      where.sessionDate = { gte: new Date() };
    }

    if (currentUser.role === UserRole.MEMBER) {
      const member = await this.prisma.member.findUnique({
        where: { userId: currentUser.userId },
        select: { id: true },
      });
      if (!member) throw new NotFoundException('Member profile not found');
      where.memberId = member.id;
    }

    if (currentUser.role === UserRole.TRAINER) {
      const trainer = await this.prisma.trainer.findUnique({
        where: { userId: currentUser.userId },
        select: { id: true },
      });
      if (!trainer) throw new NotFoundException('Trainer profile not found');
      where.trainerId = trainer.id;
    }

    return this.prisma.trainerSession.findMany({
      where,
      include: {
        member: { include: { user: true } },
        trainer: { include: { user: true } },
      },
      orderBy: { sessionDate: 'desc' },
    });
  }

  async completeSession(
    id: string,
    currentUser: { userId: string; role: UserRole },
  ) {
    const session = await this.prisma.trainerSession.findUnique({
      where: { id },
      include: { trainer: { select: { userId: true } } },
    });
    if (!session) throw new NotFoundException('Session not found');

    if (
      currentUser.role === UserRole.TRAINER &&
      session.trainer.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only complete your own sessions');
    }

    return this.prisma.trainerSession.update({
      where: { id },
      data: { status: SessionStatus.COMPLETED },
    });
  }

  async recordProgress(
    sessionId: string,
    dto: CreateUserProgressDto,
    currentUser: { userId: string; role: UserRole },
  ) {
    const session = await this.prisma.trainerSession.findUnique({
      where: { id: sessionId },
      include: {
        trainer: { select: { userId: true } },
        member: { select: { id: true, userId: true } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    if (
      currentUser.role === UserRole.TRAINER &&
      session.trainer.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only record your own session progress');
    }

    const progress = await this.prisma.userProgress.create({
      data: {
        memberId: session.memberId,
        weight: dto.weight,
        bmi: dto.bmi,
        bodyFat: dto.bodyFat,
        muscleMass: dto.muscleMass,
        benchPress: dto.benchPress,
        squat: dto.squat,
        deadlift: dto.deadlift,
        cardioEndurance: dto.cardioEndurance,
      },
    });

    await this.notificationsService.createForUser({
      userId: session.member.userId,
      title: 'Progress updated',
      message: 'Your trainer updated your progress metrics.',
      type: 'success',
      actionUrl: '/member',
    });

    return progress;
  }

  async getMemberProgress(
    memberId: string,
    currentUser: { userId: string; role: UserRole },
  ) {
    if (currentUser.role === UserRole.MEMBER) {
      const me = await this.prisma.member.findUnique({
        where: { userId: currentUser.userId },
        select: { id: true },
      });
      if (!me || me.id !== memberId) {
        throw new ForbiddenException('You can only access your own progress');
      }
    }

    return this.prisma.userProgress.findMany({
      where: { memberId },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });
  }

  async getMyProgress(currentUser: { userId: string; role: UserRole }) {
    if (currentUser.role !== UserRole.MEMBER) {
      throw new ForbiddenException('Only members can access this endpoint');
    }

    const member = await this.prisma.member.findUnique({
      where: { userId: currentUser.userId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    return this.prisma.userProgress.findMany({
      where: { memberId: member.id },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });
  }

  async getBookableMembers() {
    const rows = await this.prisma.member.findMany({
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return rows
      .filter((row) => row.user.status === UserStatus.ACTIVE)
      .map((row) => ({
        id: row.id,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        email: row.user.email,
      }));
  }
}
