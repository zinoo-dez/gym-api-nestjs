import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PaymentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFiltersDto } from './dto/payment-filters.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createForMember(
    dto: CreatePaymentDto,
    currentUser: { userId: string; role: UserRole },
  ): Promise<PaymentResponseDto> {
    if (currentUser.role !== UserRole.MEMBER) {
      throw new ForbiddenException('Only members can submit payments.');
    }

    const member = await this.prisma.member.findUnique({
      where: { userId: currentUser.userId },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found.');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: dto.subscriptionId },
      include: { membershipPlan: true },
    });

    if (!subscription || subscription.memberId !== member.id) {
      throw new ForbiddenException('Invalid subscription for this member.');
    }

    const payment = await this.prisma.payment.create({
      data: {
        memberId: member.id,
        subscriptionId: dto.subscriptionId,
        amount: dto.amount,
        currency: dto.currency || 'MMK',
        methodType: dto.methodType,
        provider: dto.provider,
        transactionNo: dto.transactionNo,
        screenshotUrl: dto.screenshotUrl,
        status: PaymentStatus.PENDING,
      },
      include: {
        member: { include: { user: true } },
        subscription: { include: { membershipPlan: true } },
      },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newPaymentNotification: true },
    });
    if (settings?.newPaymentNotification !== false) {
      const fullName = member.user
        ? `${member.user.firstName} ${member.user.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'New payment submitted',
        message: `${fullName} submitted a payment for ${subscription.membershipPlan?.name || 'a plan'}.`,
        type: 'info',
        actionUrl: '/admin/payments',
      });
    }

    return this.toResponseDto(payment);
  }

  async findAll(
    filters?: PaymentFiltersDto,
  ): Promise<PaginatedResponseDto<PaymentResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.methodType) where.methodType = filters.methodType;
    if (filters?.provider) where.provider = filters.provider;
    if (filters?.memberId) where.memberId = filters.memberId;

    if (filters?.search) {
      where.OR = [
        { transactionNo: { contains: filters.search, mode: 'insensitive' } },
        {
          member: {
            user: {
              OR: [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const total = await this.prisma.payment.count({ where });
    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        member: { include: { user: true } },
        subscription: { include: { membershipPlan: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const data = payments.map((payment) => this.toResponseDto(payment));
    return new PaginatedResponseDto(data, page, limit, total);
  }

  async findMyPayments(currentUser: { userId: string; role: UserRole }) {
    if (currentUser.role !== UserRole.MEMBER) {
      throw new ForbiddenException('Only members can access this resource.');
    }

    const member = await this.prisma.member.findUnique({
      where: { userId: currentUser.userId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found.');
    }

    const payments = await this.prisma.payment.findMany({
      where: { memberId: member.id },
      include: {
        subscription: { include: { membershipPlan: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) => this.toResponseDto(payment));
  }

  async updateStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: dto.status,
        adminNote: dto.adminNote,
        paidAt: dto.status === PaymentStatus.PAID ? new Date() : undefined,
      },
      include: {
        member: { include: { user: true } },
        subscription: { include: { membershipPlan: true } },
      },
    });

    return this.toResponseDto(payment);
  }

  private toResponseDto(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      memberId: payment.memberId,
      subscriptionId: payment.subscriptionId || undefined,
      amount: payment.amount,
      currency: payment.currency,
      methodType: payment.methodType,
      provider: payment.provider,
      transactionNo: payment.transactionNo,
      screenshotUrl: payment.screenshotUrl || undefined,
      status: payment.status,
      adminNote: payment.adminNote || undefined,
      description: payment.description || undefined,
      paidAt: payment.paidAt || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      member: payment.member?.user
        ? {
            id: payment.member.id,
            firstName: payment.member.user.firstName,
            lastName: payment.member.user.lastName,
            email: payment.member.user.email,
          }
        : undefined,
      subscription: payment.subscription
        ? {
            id: payment.subscription.id,
            status: payment.subscription.status,
            startDate: payment.subscription.startDate,
            endDate: payment.subscription.endDate,
            membershipPlan: payment.subscription.membershipPlan
              ? {
                  id: payment.subscription.membershipPlan.id,
                  name: payment.subscription.membershipPlan.name,
                  price: payment.subscription.membershipPlan.price,
                }
              : undefined,
          }
        : undefined,
    };
  }
}
