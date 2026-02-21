import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ProgressGoal,
  ProgressGoalStatus,
  ProgressMetric,
  ProgressPhotoPhase,
  ProgressPhotoPose,
  UserRole,
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProgressGoalDto,
  CreateProgressMilestoneDto,
  CreateProgressPhotoDto,
  PhotoComparisonQueryDto,
  ProgressGoalFiltersDto,
  ProgressMilestoneFiltersDto,
  ProgressPhotoFiltersDto,
  RecordBodyCompositionDto,
  ReportQueryDto,
  TimelineFiltersDto,
  UpdateProgressGoalDto,
} from './dto';

interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

interface ResolvedMember {
  id: string;
  userId: string;
  height: number | null;
  firstName: string;
  lastName: string;
}

interface ProgressSummary {
  totalEntries: number;
  periodStart: string | null;
  periodEnd: string | null;
  latestWeight: number | null;
  weightChange: number | null;
  latestBodyFat: number | null;
  bodyFatChange: number | null;
  latestMuscleMass: number | null;
  muscleMassChange: number | null;
  latestBmi: number | null;
  bmiChange: number | null;
}

interface DashboardData {
  summary: ProgressSummary;
  charts: {
    weight: Array<{ recordedAt: string; value: number }>;
    bodyFat: Array<{ recordedAt: string; value: number }>;
    muscleMass: Array<{ recordedAt: string; value: number }>;
    bmi: Array<{ recordedAt: string; value: number }>;
    benchPress: Array<{ recordedAt: string; value: number }>;
    squat: Array<{ recordedAt: string; value: number }>;
    deadlift: Array<{ recordedAt: string; value: number }>;
    waist: Array<{ recordedAt: string; value: number }>;
    chest: Array<{ recordedAt: string; value: number }>;
    hips: Array<{ recordedAt: string; value: number }>;
  };
  goals: Array<ProgressGoal & { progressPercent: number }>;
  milestones: Array<{
    id: string;
    goalId: string | null;
    title: string;
    description: string | null;
    reachedValue: number | null;
    unit: string | null;
    shareToken: string | null;
    sharePath: string | null;
    achievedAt: Date;
  }>;
  photos: {
    total: number;
    beforeCount: number;
    afterCount: number;
    progressCount: number;
    latest:
      | {
          id: string;
          photoUrl: string;
          pose: ProgressPhotoPose;
          phase: ProgressPhotoPhase;
          capturedAt: Date;
        }
      | null;
  };
}

interface MetricSnapshot {
  weight: number | null;
  bmi: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  leftCalf: number | null;
  rightCalf: number | null;
  benchPress: number | null;
  squat: number | null;
  deadlift: number | null;
}

@Injectable()
export class BodyCompositionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async recordMeasurement(
    dto: RecordBodyCompositionDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(dto.memberId, currentUser);
    const calculatedBmi =
      dto.bmi ?? this.calculateBmi(dto.weight, member.height) ?? null;

    const progress = await this.prisma.userProgress.create({
      data: {
        memberId: member.id,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
        weight: dto.weight,
        bmi: calculatedBmi,
        bodyFat: dto.bodyFat,
        muscleMass: dto.muscleMass,
        benchPress: dto.benchPress,
        squat: dto.squat,
        deadlift: dto.deadlift,
        cardioEndurance: dto.cardioEndurance,
        neck: dto.neck,
        chest: dto.chest,
        waist: dto.waist,
        hips: dto.hips,
        leftArm: dto.leftArm,
        rightArm: dto.rightArm,
        leftThigh: dto.leftThigh,
        rightThigh: dto.rightThigh,
        leftCalf: dto.leftCalf,
        rightCalf: dto.rightCalf,
        notes: dto.notes,
      },
    });

    const achievements = await this.syncGoalsFromProgress(member.id, progress);

    if (currentUser.userId !== member.userId) {
      await this.notificationsService.createForUser({
        userId: member.userId,
        title: 'Body composition updated',
        message: 'A new body composition entry was recorded for your profile.',
        type: 'success',
        actionUrl: '/member/progress',
      });
    }

    return { entry: progress, achievements };
  }

  async getMeasurements(
    memberId: string | undefined,
    filters: TimelineFiltersDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(memberId, currentUser, true);

    const where: Prisma.UserProgressWhereInput = {
      memberId: member.id,
      recordedAt: this.buildDateRange(filters.from, filters.to),
    };

    return this.prisma.userProgress.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: filters.take ?? 100,
    });
  }

  async createPhoto(
    dto: CreateProgressPhotoDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(dto.memberId, currentUser);

    const photo = await this.prisma.progressPhoto.create({
      data: {
        memberId: member.id,
        photoUrl: dto.photoUrl,
        pose: dto.pose,
        phase: dto.phase,
        capturedAt: dto.capturedAt ? new Date(dto.capturedAt) : undefined,
        note: dto.note,
      },
    });

    return photo;
  }

  async getPhotos(
    memberId: string | undefined,
    filters: ProgressPhotoFiltersDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(memberId, currentUser, true);

    const where: Prisma.ProgressPhotoWhereInput = {
      memberId: member.id,
      phase: filters.phase,
      pose: filters.pose,
      capturedAt: this.buildDateRange(filters.from, filters.to),
    };

    return this.prisma.progressPhoto.findMany({
      where,
      orderBy: { capturedAt: 'desc' },
      take: filters.take ?? 100,
    });
  }

  async comparePhotos(
    memberId: string | undefined,
    query: PhotoComparisonQueryDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(memberId, currentUser, true);

    const before = query.beforePhotoId
      ? await this.getMemberPhotoById(member.id, query.beforePhotoId)
      : await this.findDefaultBeforePhoto(member.id, query.pose);

    const after = query.afterPhotoId
      ? await this.getMemberPhotoById(member.id, query.afterPhotoId)
      : await this.findDefaultAfterPhoto(member.id, query.pose);

    if (!before || !after) {
      throw new NotFoundException(
        'Not enough progress photos to build a comparison',
      );
    }

    const [first, second] =
      before.capturedAt <= after.capturedAt ? [before, after] : [after, before];

    const daysBetween = Math.max(
      0,
      Math.floor(
        (second.capturedAt.getTime() - first.capturedAt.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    return {
      before: first,
      after: second,
      daysBetween,
    };
  }

  async createGoal(dto: CreateProgressGoalDto, currentUser: AuthenticatedUser) {
    const member = await this.resolveTargetMember(dto.memberId, currentUser);
    const startValue = await this.resolveGoalStartValue(member.id, dto);
    const currentValue = startValue;
    const achieved = this.isGoalAchieved(
      startValue,
      dto.targetValue,
      currentValue,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const goal = await tx.progressGoal.create({
        data: {
          memberId: member.id,
          type: dto.type,
          metric: dto.metric,
          title: dto.title,
          description: dto.description,
          unit: dto.unit,
          startValue,
          targetValue: dto.targetValue,
          currentValue,
          status: achieved ? ProgressGoalStatus.ACHIEVED : ProgressGoalStatus.ACTIVE,
          targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
          achievedAt: achieved ? new Date() : undefined,
        },
      });

      let milestone: Awaited<ReturnType<typeof tx.progressMilestone.create>> | null =
        null;

      if (achieved) {
        milestone = await tx.progressMilestone.create({
          data: {
            memberId: member.id,
            goalId: goal.id,
            title: `${goal.title} goal achieved`,
            description:
              goal.description ??
              'Goal achieved immediately from your current baseline.',
            reachedValue: goal.currentValue,
            unit: goal.unit,
          },
        });
      }

      return { goal, milestone };
    });

    return {
      goal: {
        ...result.goal,
        progressPercent: this.calculateGoalProgress(
          result.goal.startValue,
          result.goal.targetValue,
          result.goal.currentValue,
        ),
      },
      milestone: result.milestone,
    };
  }

  async getGoals(
    memberId: string | undefined,
    filters: ProgressGoalFiltersDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(memberId, currentUser, true);

    const goals = await this.prisma.progressGoal.findMany({
      where: {
        memberId: member.id,
        status: filters.status,
      },
      orderBy: { createdAt: 'desc' },
      take: filters.take ?? 50,
    });

    return goals.map((goal) => ({
      ...goal,
      progressPercent: this.calculateGoalProgress(
        goal.startValue,
        goal.targetValue,
        goal.currentValue,
      ),
    }));
  }

  async updateGoal(
    goalId: string,
    dto: UpdateProgressGoalDto,
    currentUser: AuthenticatedUser,
  ) {
    const existing = await this.prisma.progressGoal.findUnique({
      where: { id: goalId },
      include: {
        member: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Goal not found');
    }

    await this.resolveTargetMember(existing.member.id, currentUser, true);

    const nextTargetValue = dto.targetValue ?? existing.targetValue;
    const nextCurrentValue = dto.currentValue ?? existing.currentValue;
    const requestedStatus = dto.status ?? existing.status;

    let nextStatus = requestedStatus;
    let achievedAt = existing.achievedAt;
    const shouldAutoEvaluate =
      requestedStatus !== ProgressGoalStatus.CANCELLED &&
      requestedStatus !== ProgressGoalStatus.PAUSED;
    const nowAchieved = shouldAutoEvaluate
      ? this.isGoalAchieved(
          existing.startValue,
          nextTargetValue,
          nextCurrentValue,
        )
      : false;

    if (nowAchieved) {
      nextStatus = ProgressGoalStatus.ACHIEVED;
      if (!achievedAt) {
        achievedAt = new Date();
      }
    } else if (requestedStatus === ProgressGoalStatus.ACTIVE) {
      achievedAt = null;
    }

    const shouldCreateMilestone = nowAchieved && !existing.achievedAt;

    const result = await this.prisma.$transaction(async (tx) => {
      const goal = await tx.progressGoal.update({
        where: { id: goalId },
        data: {
          title: dto.title,
          description: dto.description,
          unit: dto.unit,
          targetValue: dto.targetValue,
          currentValue: dto.currentValue,
          status: nextStatus,
          targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
          achievedAt,
        },
      });

      let milestone: Awaited<ReturnType<typeof tx.progressMilestone.create>> | null =
        null;

      if (shouldCreateMilestone) {
        milestone = await tx.progressMilestone.create({
          data: {
            memberId: goal.memberId,
            goalId: goal.id,
            title: `${goal.title} goal achieved`,
            description: goal.description ?? 'Goal target reached.',
            reachedValue: goal.currentValue,
            unit: goal.unit,
          },
        });
      }

      return { goal, milestone };
    });

    return {
      goal: {
        ...result.goal,
        progressPercent: this.calculateGoalProgress(
          result.goal.startValue,
          result.goal.targetValue,
          result.goal.currentValue,
        ),
      },
      milestone: result.milestone,
    };
  }

  async createMilestone(
    dto: CreateProgressMilestoneDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(dto.memberId, currentUser);

    if (dto.goalId) {
      const goal = await this.prisma.progressGoal.findUnique({
        where: { id: dto.goalId },
        select: { id: true, memberId: true },
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      if (goal.memberId !== member.id) {
        throw new BadRequestException('Goal does not belong to the target member');
      }
    }

    return this.prisma.progressMilestone.create({
      data: {
        memberId: member.id,
        goalId: dto.goalId,
        title: dto.title,
        description: dto.description,
        reachedValue: dto.reachedValue,
        unit: dto.unit,
        achievedAt: dto.achievedAt ? new Date(dto.achievedAt) : undefined,
      },
    });
  }

  async getMilestones(
    memberId: string | undefined,
    filters: ProgressMilestoneFiltersDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(memberId, currentUser, true);

    const where: Prisma.ProgressMilestoneWhereInput = {
      memberId: member.id,
      achievedAt: this.buildDateRange(filters.from, filters.to),
    };

    const milestones = await this.prisma.progressMilestone.findMany({
      where,
      orderBy: { achievedAt: 'desc' },
      take: filters.take ?? 100,
    });

    return milestones.map((milestone) => ({
      ...milestone,
      sharePath: milestone.shareToken
        ? `/api/body-composition/share/${milestone.shareToken}`
        : null,
    }));
  }

  async shareMilestone(id: string, currentUser: AuthenticatedUser) {
    const milestone = await this.prisma.progressMilestone.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    await this.resolveTargetMember(milestone.member.id, currentUser, true);

    const shareToken = milestone.shareToken ?? this.generateShareToken();

    if (!milestone.shareToken) {
      await this.prisma.progressMilestone.update({
        where: { id: milestone.id },
        data: { shareToken },
      });
    }

    return {
      id: milestone.id,
      shareToken,
      sharePath: `/api/body-composition/share/${shareToken}`,
    };
  }

  async getSharedMilestone(shareToken: string) {
    const milestone = await this.prisma.progressMilestone.findUnique({
      where: { shareToken },
      include: {
        goal: true,
        member: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException('Shared achievement not found');
    }

    const lastInitial = milestone.member.user.lastName
      ? `${milestone.member.user.lastName.charAt(0)}.`
      : '';

    return {
      achievement: {
        title: milestone.title,
        description: milestone.description,
        reachedValue: milestone.reachedValue,
        unit: milestone.unit,
        achievedAt: milestone.achievedAt,
      },
      owner: {
        firstName: milestone.member.user.firstName,
        lastInitial,
      },
      goal: milestone.goal
        ? {
            title: milestone.goal.title,
            type: milestone.goal.type,
            metric: milestone.goal.metric,
            targetValue: milestone.goal.targetValue,
            unit: milestone.goal.unit,
          }
        : null,
    };
  }

  async getDashboard(
    memberId: string | undefined,
    query: ReportQueryDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(memberId, currentUser, true);

    return this.buildDashboardData(member.id, query);
  }

  async getReport(
    memberId: string | undefined,
    query: ReportQueryDto,
    currentUser: AuthenticatedUser,
  ) {
    const member = await this.resolveTargetMember(memberId, currentUser, true);

    const dashboard = await this.buildDashboardData(member.id, query);

    return {
      generatedAt: new Date().toISOString(),
      period: {
        from: query.from ?? null,
        to: query.to ?? null,
      },
      summary: dashboard.summary,
      highlights: this.buildHighlights(dashboard.summary),
      goals: dashboard.goals,
      milestones: dashboard.milestones,
      photoSummary: dashboard.photos,
      chartSeries: dashboard.charts,
    };
  }

  private async buildDashboardData(
    memberId: string,
    query: ReportQueryDto,
  ): Promise<DashboardData> {
    const dateRange = this.buildDateRange(query.from, query.to);

    const [rawEntries, goals, milestones, photos] = await Promise.all([
      this.prisma.userProgress.findMany({
        where: {
          memberId,
          recordedAt: dateRange,
        },
        orderBy: { recordedAt: 'desc' },
        take: 365,
      }),
      this.prisma.progressGoal.findMany({
        where: { memberId },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        take: 100,
      }),
      this.prisma.progressMilestone.findMany({
        where: {
          memberId,
          achievedAt: dateRange,
        },
        orderBy: { achievedAt: 'desc' },
        take: 50,
      }),
      this.prisma.progressPhoto.findMany({
        where: {
          memberId,
          capturedAt: dateRange,
        },
        orderBy: { capturedAt: 'desc' },
        take: 200,
      }),
    ]);

    const entries = rawEntries.reverse();

    const firstEntry = entries[0] ?? null;
    const lastEntry = entries.at(-1) ?? null;

    const summary: ProgressSummary = {
      totalEntries: entries.length,
      periodStart: firstEntry?.recordedAt.toISOString() ?? null,
      periodEnd: lastEntry?.recordedAt.toISOString() ?? null,
      latestWeight: lastEntry?.weight ?? null,
      weightChange: this.calculateDelta(firstEntry?.weight, lastEntry?.weight),
      latestBodyFat: lastEntry?.bodyFat ?? null,
      bodyFatChange: this.calculateDelta(firstEntry?.bodyFat, lastEntry?.bodyFat),
      latestMuscleMass: lastEntry?.muscleMass ?? null,
      muscleMassChange: this.calculateDelta(
        firstEntry?.muscleMass,
        lastEntry?.muscleMass,
      ),
      latestBmi: lastEntry?.bmi ?? null,
      bmiChange: this.calculateDelta(firstEntry?.bmi, lastEntry?.bmi),
    };

    const charts = {
      weight: this.createSeries(entries, (entry) => entry.weight),
      bodyFat: this.createSeries(entries, (entry) => entry.bodyFat),
      muscleMass: this.createSeries(entries, (entry) => entry.muscleMass),
      bmi: this.createSeries(entries, (entry) => entry.bmi),
      benchPress: this.createSeries(entries, (entry) => entry.benchPress),
      squat: this.createSeries(entries, (entry) => entry.squat),
      deadlift: this.createSeries(entries, (entry) => entry.deadlift),
      waist: this.createSeries(entries, (entry) => entry.waist),
      chest: this.createSeries(entries, (entry) => entry.chest),
      hips: this.createSeries(entries, (entry) => entry.hips),
    };

    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      progressPercent: this.calculateGoalProgress(
        goal.startValue,
        goal.targetValue,
        goal.currentValue,
      ),
    }));

    const milestonesWithShare = milestones.map((milestone) => ({
      id: milestone.id,
      goalId: milestone.goalId,
      title: milestone.title,
      description: milestone.description,
      reachedValue: milestone.reachedValue,
      unit: milestone.unit,
      shareToken: milestone.shareToken,
      sharePath: milestone.shareToken
        ? `/api/body-composition/share/${milestone.shareToken}`
        : null,
      achievedAt: milestone.achievedAt,
    }));

    const photosSummary = {
      total: photos.length,
      beforeCount: photos.filter((photo) => photo.phase === ProgressPhotoPhase.BEFORE)
        .length,
      afterCount: photos.filter((photo) => photo.phase === ProgressPhotoPhase.AFTER)
        .length,
      progressCount: photos.filter(
        (photo) => photo.phase === ProgressPhotoPhase.PROGRESS,
      ).length,
      latest: photos[0]
        ? {
            id: photos[0].id,
            photoUrl: photos[0].photoUrl,
            pose: photos[0].pose,
            phase: photos[0].phase,
            capturedAt: photos[0].capturedAt,
          }
        : null,
    };

    return {
      summary,
      charts,
      goals: goalsWithProgress,
      milestones: milestonesWithShare,
      photos: photosSummary,
    };
  }

  private async resolveTargetMember(
    requestedMemberId: string | undefined,
    currentUser: AuthenticatedUser,
    isReadOnly = false,
  ): Promise<ResolvedMember> {
    if (currentUser.role === UserRole.MEMBER) {
      const self = await this.prisma.member.findUnique({
        where: { userId: currentUser.userId },
        select: {
          id: true,
          userId: true,
          height: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!self) {
        throw new NotFoundException('Member profile not found');
      }

      if (requestedMemberId && requestedMemberId !== self.id) {
        throw new ForbiddenException('You can only access your own progress data');
      }

      return {
        id: self.id,
        userId: self.userId,
        height: self.height,
        firstName: self.user.firstName,
        lastName: self.user.lastName,
      };
    }

    if (!requestedMemberId) {
      throw new BadRequestException('memberId is required for this role');
    }

    const member = await this.prisma.member.findUnique({
      where: { id: requestedMemberId },
      select: {
        id: true,
        userId: true,
        height: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (currentUser.role === UserRole.TRAINER) {
      await this.assertTrainerCanAccessMember(currentUser.userId, member.id);
    }

    if (!isReadOnly && currentUser.role === UserRole.STAFF) {
      return {
        id: member.id,
        userId: member.userId,
        height: member.height,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
      };
    }

    return {
      id: member.id,
      userId: member.userId,
      height: member.height,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
    };
  }

  private async assertTrainerCanAccessMember(
    trainerUserId: string,
    memberId: string,
  ) {
    const trainer = await this.prisma.trainer.findUnique({
      where: { userId: trainerUserId },
      select: { id: true },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    const [workoutPlan, session] = await Promise.all([
      this.prisma.workoutPlan.findFirst({
        where: {
          trainerId: trainer.id,
          memberId,
        },
        select: { id: true },
      }),
      this.prisma.trainerSession.findFirst({
        where: {
          trainerId: trainer.id,
          memberId,
        },
        select: { id: true },
      }),
    ]);

    if (!workoutPlan && !session) {
      throw new ForbiddenException(
        'You can only access members assigned to your sessions or plans',
      );
    }
  }

  private buildDateRange(from?: string, to?: string): Prisma.DateTimeFilter | undefined {
    if (!from && !to) {
      return undefined;
    }

    const range: Prisma.DateTimeFilter = {};

    if (from) {
      range.gte = new Date(from);
    }

    if (to) {
      range.lte = new Date(to);
    }

    if (range.gte && range.lte && range.gte > range.lte) {
      throw new BadRequestException('from date must be earlier than to date');
    }

    return range;
  }

  private calculateBmi(weight?: number, height?: number | null): number | undefined {
    if (weight === undefined || height === undefined || height === null) {
      return undefined;
    }

    const normalizedHeight = height > 3 ? height / 100 : height;

    if (normalizedHeight <= 0) {
      return undefined;
    }

    const bmi = weight / (normalizedHeight * normalizedHeight);
    return this.round(bmi);
  }

  private round(value: number, precision = 2): number {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }

  private calculateDelta(
    first?: number | null,
    last?: number | null,
  ): number | null {
    if (first === undefined || first === null || last === undefined || last === null) {
      return null;
    }

    return this.round(last - first);
  }

  private createSeries<T extends { recordedAt: Date }>(
    entries: T[],
    selector: (entry: T) => number | null,
  ): Array<{ recordedAt: string; value: number }> {
    return entries.flatMap((entry) => {
      const value = selector(entry);

      if (value === null || value === undefined) {
        return [];
      }

      return [{ recordedAt: entry.recordedAt.toISOString(), value: this.round(value) }];
    });
  }

  private async syncGoalsFromProgress(
    memberId: string,
    progress: MetricSnapshot,
  ) {
    const activeGoals = await this.prisma.progressGoal.findMany({
      where: {
        memberId,
        status: ProgressGoalStatus.ACTIVE,
      },
    });

    const achievedMilestones: Array<{
      milestoneId: string;
      goalId: string;
      title: string;
    }> = [];

    for (const goal of activeGoals) {
      const metricValue = this.getMetricValue(progress, goal.metric);

      if (metricValue === undefined) {
        continue;
      }

      const goalAchieved = this.isGoalAchieved(
        goal.startValue,
        goal.targetValue,
        metricValue,
      );

      if (!goalAchieved) {
        await this.prisma.progressGoal.update({
          where: { id: goal.id },
          data: { currentValue: metricValue },
        });
        continue;
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updatedGoal = await tx.progressGoal.update({
          where: { id: goal.id },
          data: {
            currentValue: metricValue,
            status: ProgressGoalStatus.ACHIEVED,
            achievedAt: new Date(),
          },
        });

        const milestone = await tx.progressMilestone.create({
          data: {
            memberId,
            goalId: goal.id,
            title: `${goal.title} goal achieved`,
            description:
              goal.description ?? 'Goal target reached from progress entry.',
            reachedValue: metricValue,
            unit: goal.unit,
          },
        });

        return { updatedGoal, milestone };
      });

      achievedMilestones.push({
        milestoneId: result.milestone.id,
        goalId: goal.id,
        title: result.milestone.title,
      });
    }

    if (achievedMilestones.length > 0) {
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
        select: { userId: true },
      });

      if (member) {
        await this.notificationsService.createForUser({
          userId: member.userId,
          title: 'Achievement unlocked',
          message: `You unlocked ${achievedMilestones.length} new milestone${
            achievedMilestones.length > 1 ? 's' : ''
          }.`,
          type: 'success',
          actionUrl: '/member/progress',
        });
      }
    }

    return achievedMilestones;
  }

  private getMetricValue(
    snapshot: MetricSnapshot,
    metric: ProgressMetric,
  ): number | undefined {
    switch (metric) {
      case ProgressMetric.WEIGHT:
        return snapshot.weight ?? undefined;
      case ProgressMetric.BMI:
        return snapshot.bmi ?? undefined;
      case ProgressMetric.BODY_FAT:
        return snapshot.bodyFat ?? undefined;
      case ProgressMetric.MUSCLE_MASS:
        return snapshot.muscleMass ?? undefined;
      case ProgressMetric.CHEST:
        return snapshot.chest ?? undefined;
      case ProgressMetric.WAIST:
        return snapshot.waist ?? undefined;
      case ProgressMetric.HIPS:
        return snapshot.hips ?? undefined;
      case ProgressMetric.LEFT_ARM:
        return snapshot.leftArm ?? undefined;
      case ProgressMetric.RIGHT_ARM:
        return snapshot.rightArm ?? undefined;
      case ProgressMetric.LEFT_THIGH:
        return snapshot.leftThigh ?? undefined;
      case ProgressMetric.RIGHT_THIGH:
        return snapshot.rightThigh ?? undefined;
      case ProgressMetric.LEFT_CALF:
        return snapshot.leftCalf ?? undefined;
      case ProgressMetric.RIGHT_CALF:
        return snapshot.rightCalf ?? undefined;
      case ProgressMetric.BENCH_PRESS:
        return snapshot.benchPress ?? undefined;
      case ProgressMetric.SQUAT:
        return snapshot.squat ?? undefined;
      case ProgressMetric.DEADLIFT:
        return snapshot.deadlift ?? undefined;
      case ProgressMetric.CUSTOM:
      default:
        return undefined;
    }
  }

  private isGoalAchieved(
    startValue: number,
    targetValue: number,
    currentValue: number,
  ): boolean {
    if (targetValue >= startValue) {
      return currentValue >= targetValue;
    }

    return currentValue <= targetValue;
  }

  private calculateGoalProgress(
    startValue: number,
    targetValue: number,
    currentValue: number,
  ): number {
    if (targetValue === startValue) {
      return currentValue >= targetValue ? 100 : 0;
    }

    const increasing = targetValue > startValue;
    const numerator = increasing
      ? currentValue - startValue
      : startValue - currentValue;
    const denominator = increasing
      ? targetValue - startValue
      : startValue - targetValue;

    const percent = (numerator / denominator) * 100;

    if (Number.isNaN(percent) || !Number.isFinite(percent)) {
      return 0;
    }

    return Math.min(100, Math.max(0, this.round(percent)));
  }

  private async resolveGoalStartValue(
    memberId: string,
    dto: CreateProgressGoalDto,
  ): Promise<number> {
    if (dto.startValue !== undefined) {
      return dto.startValue;
    }

    if (dto.metric === ProgressMetric.CUSTOM) {
      throw new BadRequestException('startValue is required for CUSTOM goals');
    }

    const latestEntry = await this.prisma.userProgress.findFirst({
      where: { memberId },
      orderBy: { recordedAt: 'desc' },
    });

    if (!latestEntry) {
      throw new BadRequestException(
        'startValue is required when no progress history exists',
      );
    }

    const inferred = this.getMetricValue(latestEntry, dto.metric);

    if (inferred === undefined) {
      throw new BadRequestException(
        'startValue is required because this metric has no recorded baseline yet',
      );
    }

    return inferred;
  }

  private async getMemberPhotoById(memberId: string, photoId: string) {
    const photo = await this.prisma.progressPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.memberId !== memberId) {
      throw new NotFoundException('Photo not found');
    }

    return photo;
  }

  private async findDefaultBeforePhoto(
    memberId: string,
    pose?: ProgressPhotoPose,
  ) {
    const poseFilter: Prisma.ProgressPhotoWhereInput = pose ? { pose } : {};

    return (
      (await this.prisma.progressPhoto.findFirst({
        where: {
          memberId,
          phase: ProgressPhotoPhase.BEFORE,
          ...poseFilter,
        },
        orderBy: { capturedAt: 'asc' },
      })) ??
      this.prisma.progressPhoto.findFirst({
        where: {
          memberId,
          ...poseFilter,
        },
        orderBy: { capturedAt: 'asc' },
      })
    );
  }

  private async findDefaultAfterPhoto(
    memberId: string,
    pose?: ProgressPhotoPose,
  ) {
    const poseFilter: Prisma.ProgressPhotoWhereInput = pose ? { pose } : {};

    return (
      (await this.prisma.progressPhoto.findFirst({
        where: {
          memberId,
          phase: ProgressPhotoPhase.AFTER,
          ...poseFilter,
        },
        orderBy: { capturedAt: 'desc' },
      })) ??
      this.prisma.progressPhoto.findFirst({
        where: {
          memberId,
          ...poseFilter,
        },
        orderBy: { capturedAt: 'desc' },
      })
    );
  }

  private buildHighlights(summary: ProgressSummary): string[] {
    const highlights: string[] = [];

    if (summary.weightChange !== null) {
      if (summary.weightChange < 0) {
        highlights.push(
          `Weight decreased by ${Math.abs(summary.weightChange)} in this period.`,
        );
      } else if (summary.weightChange > 0) {
        highlights.push(`Weight increased by ${summary.weightChange} in this period.`);
      }
    }

    if (summary.bodyFatChange !== null) {
      if (summary.bodyFatChange < 0) {
        highlights.push(
          `Body fat dropped by ${Math.abs(summary.bodyFatChange)} percentage points.`,
        );
      } else if (summary.bodyFatChange > 0) {
        highlights.push(
          `Body fat rose by ${summary.bodyFatChange} percentage points.`,
        );
      }
    }

    if (summary.muscleMassChange !== null) {
      if (summary.muscleMassChange > 0) {
        highlights.push(`Muscle mass improved by ${summary.muscleMassChange}.`);
      } else if (summary.muscleMassChange < 0) {
        highlights.push(
          `Muscle mass decreased by ${Math.abs(summary.muscleMassChange)}.`,
        );
      }
    }

    if (highlights.length === 0) {
      highlights.push('Keep logging progress to unlock trend insights.');
    }

    return highlights;
  }

  private generateShareToken(): string {
    return randomUUID().replace(/-/g, '');
  }
}
