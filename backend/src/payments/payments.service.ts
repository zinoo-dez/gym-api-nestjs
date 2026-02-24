import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InvoiceStatus,
  Prisma,
  PaymentMethodType,
  PaymentProvider,
  PaymentStatus,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFiltersDto } from './dto/payment-filters.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { RecoveryQueueResponseDto } from './dto/recovery-queue-response.dto';
import { SendRecoveryFollowUpDto } from './dto/send-recovery-followup.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { PaymentInvoiceResponseDto } from './dto/payment-invoice-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    dto: CreatePaymentDto,
    currentUser: { userId: string; role: UserRole },
  ): Promise<PaymentResponseDto> {
    const isManualAdminFlow =
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.STAFF;
    const member = await this.resolveMemberForCreate(dto, currentUser);

    if (!member) {
      throw new NotFoundException('Member not found.');
    }

    let subscription: Prisma.SubscriptionGetPayload<{
      include: { membershipPlan: true };
    }> | null = null;
    if (dto.subscriptionId) {
      subscription = await this.prisma.subscription.findUnique({
        where: { id: dto.subscriptionId },
        include: { membershipPlan: true },
      });
    }

    if (subscription && subscription.memberId !== member.id) {
      throw new ForbiddenException('Invalid subscription for this member.');
    }
    if (!subscription && currentUser.role === UserRole.MEMBER) {
      throw new BadRequestException(
        'subscriptionId is required for member payments.',
      );
    }

    const methodType = this.resolveMethodType(dto);
    const provider = this.resolveProvider(dto);
    const now = new Date();
    const transactionNo =
      dto.transactionNo?.trim() ||
      `PMT-${now.getTime()}-${member.id.slice(-6)}`;

    const payment = await this.prisma.payment.create({
      data: {
        memberId: member.id,
        subscriptionId: dto.subscriptionId ?? undefined,
        amount: dto.amount,
        currency: dto.currency || 'MMK',
        methodType,
        provider,
        transactionNo,
        screenshotUrl: dto.screenshotUrl,
        status: isManualAdminFlow ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paidAt: isManualAdminFlow ? now : undefined,
      },
      include: {
        member: { include: { user: true } },
        subscription: { include: { membershipPlan: true } },
      },
    });

    await this.ensureInvoiceForPayment(payment.id);

    if (isManualAdminFlow) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Manual payment recorded',
        message: `Payment ${transactionNo} recorded by staff.`,
        type: 'success',
        actionUrl: '/admin/payments',
      });
    } else {
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
          message: `${fullName} submitted a payment for ${subscription?.membershipPlan?.name || 'a plan'}.`,
          type: 'info',
          actionUrl: '/admin/payments',
        });
      }
    }

    const refreshedPayment = await this.prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        member: { include: { user: true } },
        subscription: { include: { membershipPlan: true } },
      },
    });
    if (!refreshedPayment) {
      throw new NotFoundException('Payment not found after creation.');
    }
    return this.toResponseDto(refreshedPayment);
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
                {
                  firstName: { contains: filters.search, mode: 'insensitive' },
                },
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
    const payment = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({
        where: { id },
        include: {
          member: { include: { user: true } },
          subscription: { include: { membershipPlan: true } },
        },
      });

      if (!existing) {
        throw new NotFoundException('Payment not found.');
      }

      const updated = await tx.payment.update({
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

      if (updated.subscriptionId) {
        if (dto.status === PaymentStatus.PAID) {
          const durationDays =
            updated.subscription?.membershipPlan?.duration || 30;
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + durationDays);

          await tx.subscription.update({
            where: { id: updated.subscriptionId },
            data: {
              status: SubscriptionStatus.ACTIVE,
              startDate,
              endDate,
            },
          });
        } else if (dto.status === PaymentStatus.REJECTED) {
          await tx.subscription.update({
            where: { id: updated.subscriptionId },
            data: {
              status: SubscriptionStatus.CANCELLED,
            },
          });
        }
      }

      return updated;
    });

    return this.toResponseDto(payment);
  }

  async getRecoveryQueue(days = 7): Promise<RecoveryQueueResponseDto> {
    const now = new Date();
    const horizon = new Date(
      now.getTime() + Math.max(1, days) * 24 * 60 * 60 * 1000,
    );

    const [expiringSubscriptions, pendingPayments, rejectedPayments] =
      await Promise.all([
        this.prisma.subscription.findMany({
          where: {
            status: SubscriptionStatus.ACTIVE,
            endDate: { gte: now, lte: horizon },
          },
          include: {
            member: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
            membershipPlan: { select: { name: true } },
          },
          orderBy: { endDate: 'asc' },
          take: 200,
        }),
        this.prisma.payment.findMany({
          where: { status: PaymentStatus.PENDING },
          include: {
            member: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 200,
        }),
        this.prisma.payment.findMany({
          where: {
            status: PaymentStatus.REJECTED,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            member: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 200,
        }),
      ]);

    return {
      expiringSoon: expiringSubscriptions.map((sub) => ({
        subscriptionId: sub.id,
        memberId: sub.memberId,
        memberName:
          `${sub.member.user.firstName} ${sub.member.user.lastName}`.trim(),
        memberEmail: sub.member.user.email,
        planName: sub.membershipPlan?.name ?? 'Plan',
        endDate: sub.endDate,
        daysToExpiry: Math.max(
          0,
          Math.ceil(
            (sub.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
          ),
        ),
      })),
      pendingPayments: pendingPayments.map((payment) =>
        this.toRecoveryPaymentItem(payment),
      ),
      rejectedPayments: rejectedPayments.map((payment) =>
        this.toRecoveryPaymentItem(payment),
      ),
      totalExpiringSoon: expiringSubscriptions.length,
      totalPendingPayments: pendingPayments.length,
      totalRejectedPayments: rejectedPayments.length,
    };
  }

  async sendRecoveryFollowUp(
    paymentId: string,
    dto: SendRecoveryFollowUpDto,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        member: { include: { user: true } },
        subscription: { include: { membershipPlan: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    const userId = payment.member.userId;
    const defaultMessage =
      payment.status === PaymentStatus.REJECTED
        ? 'Your payment was rejected. Please retry with a valid proof screenshot.'
        : 'Your payment is pending verification. Please ensure your transaction proof is clear.';
    const message = dto.message?.trim() || defaultMessage;

    await this.notificationsService.createForUser({
      userId,
      title: 'Payment recovery follow-up',
      message,
      type: payment.status === PaymentStatus.REJECTED ? 'warning' : 'info',
      actionUrl: '/member',
    });

    let nextStatus = payment.status;
    if (
      dto.markAsRetryRequested === true &&
      payment.status === PaymentStatus.REJECTED
    ) {
      nextStatus = PaymentStatus.PENDING;
    }

    const notePrefix = `[Recovery ${new Date().toISOString()}] ${message}`;
    const mergedNote = payment.adminNote
      ? `${payment.adminNote}\n${notePrefix}`
      : notePrefix;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: nextStatus,
        adminNote: mergedNote,
      },
    });

    await this.notificationsService.createForRole({
      role: UserRole.ADMIN,
      title: 'Recovery follow-up sent',
      message: `Follow-up sent for payment ${payment.transactionNo}.`,
      type: 'info',
      actionUrl: '/admin/recovery',
    });
  }

  async getInvoiceByPaymentOrInvoiceId(
    id: string,
    currentUser: { userId: string; role: UserRole },
  ): Promise<PaymentInvoiceResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            items: true,
            member: { include: { user: true } },
          },
        },
        member: { include: { user: true } },
      },
    });

    if (payment?.invoice) {
      this.ensureInvoiceAccess(payment.invoice.member.userId, currentUser);
      return this.toInvoiceResponse(payment.invoice);
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        OR: [{ id }, { invoiceNumber: id }],
      },
      include: {
        items: true,
        member: { include: { user: true } },
      },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }

    this.ensureInvoiceAccess(invoice.member.userId, currentUser);
    return this.toInvoiceResponse(invoice);
  }

  async processRefund(
    paymentId: string,
    dto: ProcessRefundDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        member: { include: { user: true } },
        subscription: { include: { membershipPlan: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid payments can be refunded.');
    }

    const requestedAmount = dto.amount ?? payment.amount;
    if (requestedAmount <= 0 || requestedAmount > payment.amount) {
      throw new BadRequestException(
        'Refund amount must be greater than 0 and not exceed payment amount.',
      );
    }

    const refundNote = `[Refund ${new Date().toISOString()}] amount=${requestedAmount} reason=${dto.reason.trim()}`;
    const mergedNote = payment.adminNote
      ? `${payment.adminNote}\n${refundNote}`
      : refundNote;

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        adminNote: mergedNote,
      },
      include: {
        member: { include: { user: true } },
        subscription: { include: { membershipPlan: true } },
      },
    });

    await this.notificationsService.createForRole({
      role: UserRole.ADMIN,
      title: 'Payment refund processed',
      message: `Refund logged for payment ${updated.transactionNo}.`,
      type: 'warning',
      actionUrl: '/admin/payments',
    });

    return this.toResponseDto(updated);
  }

  private toResponseDto(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      memberId: payment.memberId,
      invoiceId: payment.invoiceId || undefined,
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

  private toRecoveryPaymentItem(payment: {
    id: string;
    memberId: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    createdAt: Date;
    subscriptionId: string | null;
    member: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  }) {
    return {
      paymentId: payment.id,
      memberId: payment.memberId,
      memberName:
        `${payment.member.user.firstName} ${payment.member.user.lastName}`.trim(),
      memberEmail: payment.member.user.email,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      subscriptionId: payment.subscriptionId ?? undefined,
    };
  }

  private resolveMethodType(dto: CreatePaymentDto): PaymentMethodType {
    if (dto.methodType) {
      return dto.methodType;
    }
    const method = dto.paymentMethod?.toUpperCase().trim();
    if (method === 'TRANSFER') {
      return PaymentMethodType.BANK;
    }
    return PaymentMethodType.WALLET;
  }

  private resolveProvider(dto: CreatePaymentDto): PaymentProvider {
    if (dto.provider) {
      return dto.provider;
    }

    const method = dto.paymentMethod?.toUpperCase().trim();
    if (method === 'TRANSFER') {
      return PaymentProvider.KBZ;
    }
    return PaymentProvider.KBZ_PAY;
  }

  private async resolveMemberForCreate(
    dto: CreatePaymentDto,
    currentUser: { userId: string; role: UserRole },
  ) {
    if (currentUser.role === UserRole.MEMBER) {
      return this.prisma.member.findUnique({
        where: { userId: currentUser.userId },
        include: { user: true },
      });
    }

    if (
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.STAFF
    ) {
      if (!dto.memberId) {
        throw new BadRequestException(
          'memberId is required for manual payments.',
        );
      }
      return this.prisma.member.findUnique({
        where: { id: dto.memberId },
        include: { user: true },
      });
    }

    throw new ForbiddenException('Unsupported role for payment creation.');
  }

  private async ensureInvoiceForPayment(paymentId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        member: { include: { user: true } },
      },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }
    if (payment.invoiceId) {
      return;
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        memberId: payment.memberId,
        invoiceNumber: `INV-${Date.now()}-${payment.id.slice(-6).toUpperCase()}`,
        status:
          payment.status === PaymentStatus.PAID
            ? InvoiceStatus.PAID
            : InvoiceStatus.SENT,
        subtotal: payment.amount,
        tax: 0,
        discount: 0,
        total: payment.amount,
        dueDate: new Date(
          payment.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000,
        ),
        paidAt:
          payment.status === PaymentStatus.PAID
            ? (payment.paidAt ?? new Date())
            : null,
        notes: payment.adminNote ?? undefined,
        items: {
          create: {
            description: 'Gym payment',
            quantity: 1,
            unitPrice: payment.amount,
            total: payment.amount,
            itemType: 'PAYMENT',
          },
        },
      },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { invoiceId: invoice.id },
    });
  }

  private ensureInvoiceAccess(
    memberUserId: string,
    currentUser: { userId: string; role: UserRole },
  ): void {
    if (
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.STAFF
    ) {
      return;
    }
    if (
      currentUser.role === UserRole.MEMBER &&
      currentUser.userId === memberUserId
    ) {
      return;
    }

    throw new ForbiddenException('You do not have access to this invoice.');
  }

  private toInvoiceResponse(invoice: {
    id: string;
    invoiceNumber: string;
    createdAt: Date;
    dueDate: Date;
    status: InvoiceStatus;
    subtotal: number;
    tax: number;
    total: number;
    notes: string | null;
    member: {
      id: string;
      user: { firstName: string; lastName: string; email: string };
    };
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  }): PaymentInvoiceResponseDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.createdAt,
      dueAt: invoice.dueDate,
      status: invoice.status,
      currency: 'MMK',
      gym: {
        name: 'Gym',
      },
      member: {
        id: invoice.member.id,
        name: `${invoice.member.user.firstName} ${invoice.member.user.lastName}`.trim(),
        email: invoice.member.user.email,
      },
      items: invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.total,
      })),
      subtotal: invoice.subtotal,
      taxRate: 0,
      taxAmount: invoice.tax,
      total: invoice.total,
      notes: invoice.notes ?? undefined,
    };
  }
}
