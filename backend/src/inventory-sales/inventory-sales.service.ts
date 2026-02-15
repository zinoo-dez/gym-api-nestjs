import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Product,
  Prisma,
  ProductSaleStatus,
  StockMovementType,
  UserRole,
} from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  CreateSaleDto,
  LowStockAlertResponseDto,
  ProductFiltersDto,
  ProductResponseDto,
  RestockProductDto,
  SaleFiltersDto,
  SaleResponseDto,
  SalesReportQueryDto,
  SalesReportResponseDto,
  UpdateProductDto,
} from './dto';

type AuthUser = {
  userId: string;
  role: UserRole;
};

type SaleWithRelations = Prisma.ProductSaleGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
    member: {
      include: {
        user: {
          select: {
            firstName: true;
            lastName: true;
            email: true;
          };
        };
      };
    };
    processedBy: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

@Injectable()
export class InventorySalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`Product SKU ${dto.sku} already exists`);
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        category: dto.category,
        description: dto.description,
        salePrice: dto.salePrice,
        costPrice: dto.costPrice,
        stockQuantity: dto.stockQuantity ?? 0,
        lowStockThreshold: dto.lowStockThreshold ?? 5,
        isActive: dto.isActive ?? true,
      },
    });

    return this.toProductDto(product);
  }

  async findProducts(
    filters: ProductFiltersDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          sku: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (filters.lowStockOnly) {
      const allProducts = await this.prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });

      const lowStockProducts = allProducts.filter(
        (product) => product.stockQuantity <= product.lowStockThreshold,
      );

      const paged = lowStockProducts.slice(skip, skip + limit);
      return new PaginatedResponseDto(
        paged.map((product) => this.toProductDto(product)),
        page,
        limit,
        lowStockProducts.length,
      );
    }

    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return new PaginatedResponseDto(
      rows.map((product) => this.toProductDto(product)),
      page,
      limit,
      total,
    );
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    currentUser: AuthUser,
  ): Promise<ProductResponseDto> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const skuExists = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
        select: { id: true },
      });
      if (skuExists) {
        throw new ConflictException(`Product SKU ${dto.sku} already exists`);
      }
    }

    const previousQuantity = existing.stockQuantity;
    const targetQuantity = dto.stockQuantity;

    const product = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          sku: dto.sku,
          category: dto.category,
          description: dto.description,
          salePrice: dto.salePrice,
          costPrice: dto.costPrice,
          lowStockThreshold: dto.lowStockThreshold,
          stockQuantity: dto.stockQuantity,
          isActive: dto.isActive,
        },
      });

      if (
        typeof targetQuantity === 'number' &&
        targetQuantity !== previousQuantity
      ) {
        await tx.inventoryStockMovement.create({
          data: {
            productId: id,
            movementType: StockMovementType.ADJUSTMENT,
            quantityDelta: targetQuantity - previousQuantity,
            previousQuantity,
            newQuantity: targetQuantity,
            referenceType: 'PRODUCT_UPDATE',
            note: 'Manual stock quantity edit',
            createdByUserId: currentUser.userId,
          },
        });
      }

      return updated;
    });

    if (product.stockQuantity <= product.lowStockThreshold) {
      await this.notifyLowStock([product]);
    }

    return this.toProductDto(product);
  }

  async restockProduct(
    id: string,
    dto: RestockProductDto,
    currentUser: AuthUser,
  ): Promise<ProductResponseDto> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    const newQuantity = existing.stockQuantity + dto.quantity;

    const product = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          stockQuantity: {
            increment: dto.quantity,
          },
        },
      });

      await tx.inventoryStockMovement.create({
        data: {
          productId: id,
          movementType: StockMovementType.RESTOCK,
          quantityDelta: dto.quantity,
          previousQuantity: existing.stockQuantity,
          newQuantity,
          referenceType: 'RESTOCK',
          note: dto.note,
          createdByUserId: currentUser.userId,
        },
      });

      return updated;
    });

    return this.toProductDto(product);
  }

  async getLowStockAlerts(): Promise<LowStockAlertResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ stockQuantity: 'asc' }, { updatedAt: 'asc' }],
    });

    return products
      .filter((product) => product.stockQuantity <= product.lowStockThreshold)
      .map((product) => ({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        deficit: Math.max(0, product.lowStockThreshold - product.stockQuantity),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
  }

  async createSale(
    dto: CreateSaleDto,
    currentUser: AuthUser,
  ): Promise<SaleResponseDto> {
    const productIds = dto.items.map((item) => item.productId);
    const duplicateProductId = this.findFirstDuplicate(productIds);

    if (duplicateProductId) {
      throw new BadRequestException(
        `Duplicate product ${duplicateProductId} in sale items`,
      );
    }

    if (dto.memberId) {
      const member = await this.prisma.member.findUnique({
        where: { id: dto.memberId },
        select: { id: true },
      });
      if (!member) {
        throw new NotFoundException(`Member ${dto.memberId} not found`);
      }
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missingId = productIds.find((id) => !foundIds.has(id));
      throw new NotFoundException(
        missingId
          ? `Product ${missingId} not found or inactive`
          : 'One or more products not found',
      );
    }

    const productById = new Map(products.map((product) => [product.id, product]));

    const lineItems = dto.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const unitPrice = item.unitPrice ?? product.salePrice;
      const lineTotal = unitPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = dto.discount ?? 0;
    const tax = dto.tax ?? 0;

    if (discount > subtotal) {
      throw new BadRequestException('Discount cannot be greater than subtotal');
    }

    const total = subtotal - discount + tax;
    if (total < 0) {
      throw new BadRequestException('Calculated total cannot be negative');
    }

    const soldAt = dto.soldAt ? new Date(dto.soldAt) : new Date();

    const lowStockProductsAfterSale: Product[] = [];

    const sale = await this.prisma.$transaction(async (tx) => {
      const createdSale = await tx.productSale.create({
        data: {
          saleNumber: this.generateSaleNumber(),
          memberId: dto.memberId,
          processedByUserId: currentUser.userId,
          paymentMethod: dto.paymentMethod,
          status: ProductSaleStatus.COMPLETED,
          subtotal,
          discount,
          tax,
          total,
          notes: dto.notes,
          soldAt,
        },
      });

      for (const item of lineItems) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          const product = productById.get(item.productId);
          throw new BadRequestException(
            `Insufficient stock for ${product?.name ?? item.productId}`,
          );
        }

        const updatedProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!updatedProduct) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        await tx.productSaleItem.create({
          data: {
            saleId: createdSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          },
        });

        await tx.inventoryStockMovement.create({
          data: {
            productId: item.productId,
            movementType: StockMovementType.SALE,
            quantityDelta: -item.quantity,
            previousQuantity: updatedProduct.stockQuantity + item.quantity,
            newQuantity: updatedProduct.stockQuantity,
            referenceType: 'SALE',
            referenceId: createdSale.id,
            note: `POS sale ${createdSale.saleNumber}`,
            createdByUserId: currentUser.userId,
          },
        });

        if (updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
          lowStockProductsAfterSale.push(updatedProduct);
        }
      }

      const saleWithRelations = await tx.productSale.findUnique({
        where: { id: createdSale.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          member: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          processedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!saleWithRelations) {
        throw new NotFoundException(`Sale ${createdSale.id} not found`);
      }

      return saleWithRelations;
    });

    if (lowStockProductsAfterSale.length > 0) {
      await this.notifyLowStock(lowStockProductsAfterSale);
    }

    return this.toSaleDto(sale);
  }

  async findSales(
    filters: SaleFiltersDto,
  ): Promise<PaginatedResponseDto<SaleResponseDto>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductSaleWhereInput = {};

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters.startDate || filters.endDate) {
      where.soldAt = {};
      if (filters.startDate) {
        where.soldAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.soldAt.lte = new Date(filters.endDate);
      }
    }

    if (filters.search) {
      where.OR = [
        {
          saleNumber: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          member: {
            user: {
              OR: [
                {
                  firstName: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        },
        {
          items: {
            some: {
              OR: [
                {
                  product: {
                    name: {
                      contains: filters.search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  product: {
                    sku: {
                      contains: filters.search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            },
          },
        },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.productSale.count({ where }),
      this.prisma.productSale.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          member: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          processedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { soldAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return new PaginatedResponseDto(
      rows.map((sale) => this.toSaleDto(sale)),
      page,
      limit,
      total,
    );
  }

  async getSalesReport(
    query: SalesReportQueryDto,
  ): Promise<SalesReportResponseDto> {
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be greater than endDate');
    }

    const topN = query.topN ?? 5;

    const saleWhere: Prisma.ProductSaleWhereInput = {
      status: ProductSaleStatus.COMPLETED,
      soldAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [summary, byPaymentMethod, topProductsRaw, lowStockAlerts] =
      await Promise.all([
        this.prisma.productSale.aggregate({
          where: saleWhere,
          _count: { _all: true },
          _sum: {
            subtotal: true,
            discount: true,
            tax: true,
            total: true,
          },
        }),
        this.prisma.productSale.groupBy({
          by: ['paymentMethod'],
          where: saleWhere,
          _count: { _all: true },
          _sum: {
            total: true,
          },
        }),
        this.prisma.productSaleItem.groupBy({
          by: ['productId'],
          where: {
            sale: {
              status: ProductSaleStatus.COMPLETED,
              soldAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          _sum: {
            quantity: true,
            lineTotal: true,
          },
          orderBy: {
            _sum: {
              lineTotal: 'desc',
            },
          },
          take: topN,
        }),
        this.getLowStockAlerts(),
      ]);

    const topProductIds = topProductsRaw.map((row) => row.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: topProductIds },
      },
      select: {
        id: true,
        name: true,
        sku: true,
      },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    const totalSalesCount = summary._count._all;
    const grossRevenue = summary._sum.subtotal ?? 0;
    const totalDiscount = summary._sum.discount ?? 0;
    const totalTax = summary._sum.tax ?? 0;
    const netRevenue = summary._sum.total ?? 0;

    return {
      startDate,
      endDate,
      totalSalesCount,
      grossRevenue,
      totalDiscount,
      totalTax,
      netRevenue,
      averageOrderValue: totalSalesCount > 0 ? netRevenue / totalSalesCount : 0,
      byPaymentMethod: byPaymentMethod.map((row) => ({
        paymentMethod: row.paymentMethod,
        count: row._count._all,
        totalRevenue: row._sum.total ?? 0,
      })),
      topProducts: topProductsRaw.map((row) => {
        const product = productMap.get(row.productId);
        return {
          productId: row.productId,
          name: product?.name ?? 'Unknown Product',
          sku: product?.sku ?? 'N/A',
          quantitySold: row._sum.quantity ?? 0,
          revenue: row._sum.lineTotal ?? 0,
        };
      }),
      lowStockCount: lowStockAlerts.length,
    };
  }

  private async notifyLowStock(products: Product[]) {
    const dedupedProducts = Array.from(
      new Map(products.map((product) => [product.id, product])).values(),
    );

    await Promise.all(
      dedupedProducts.map((product) => {
        const deficit = Math.max(
          0,
          product.lowStockThreshold - product.stockQuantity,
        );
        return this.notificationsService.createForRole({
          role: UserRole.ADMIN,
          title: 'Low stock alert',
          message: `${product.name} (${product.sku}) is low on stock. Remaining: ${product.stockQuantity}. Restock target gap: ${deficit}.`,
          type: 'warning',
          actionUrl: '/admin/inventory-sales',
        });
      }),
    );
  }

  private toProductDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description ?? undefined,
      salePrice: product.salePrice,
      costPrice: product.costPrice ?? undefined,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      isLowStock: product.stockQuantity <= product.lowStockThreshold,
      lowStockDeficit: Math.max(0, product.lowStockThreshold - product.stockQuantity),
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toSaleDto(sale: SaleWithRelations): SaleResponseDto {
    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      memberId: sale.memberId ?? undefined,
      processedByUserId: sale.processedByUserId ?? undefined,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total,
      notes: sale.notes ?? undefined,
      soldAt: sale.soldAt,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      items: sale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      member: sale.member?.user
        ? {
            id: sale.member.id,
            firstName: sale.member.user.firstName,
            lastName: sale.member.user.lastName,
            email: sale.member.user.email,
          }
        : undefined,
      processedBy: sale.processedBy
        ? {
            id: sale.processedBy.id,
            email: sale.processedBy.email,
            firstName: sale.processedBy.firstName,
            lastName: sale.processedBy.lastName,
          }
        : undefined,
    };
  }

  private generateSaleNumber(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = `${now.getMonth() + 1}`.padStart(2, '0');
    const dd = `${now.getDate()}`.padStart(2, '0');
    const hh = `${now.getHours()}`.padStart(2, '0');
    const min = `${now.getMinutes()}`.padStart(2, '0');
    const ss = `${now.getSeconds()}`.padStart(2, '0');
    const rand = `${Math.floor(Math.random() * 10000)}`.padStart(4, '0');
    return `POS-${yyyy}${mm}${dd}-${hh}${min}${ss}-${rand}`;
  }

  private findFirstDuplicate(values: string[]): string | null {
    const seen = new Set<string>();
    for (const value of values) {
      if (seen.has(value)) {
        return value;
      }
      seen.add(value);
    }
    return null;
  }
}
