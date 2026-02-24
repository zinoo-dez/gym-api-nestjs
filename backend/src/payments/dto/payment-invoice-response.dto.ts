export class PaymentInvoiceItemResponseDto {
  id!: string;
  description!: string;
  quantity!: number;
  unitPrice!: number;
  lineTotal!: number;
}

export class PaymentInvoiceGymResponseDto {
  name!: string;
}

export class PaymentInvoiceMemberResponseDto {
  id!: string;
  name!: string;
  email?: string;
}

export class PaymentInvoiceResponseDto {
  id!: string;
  invoiceNumber!: string;
  issuedAt!: Date;
  dueAt!: Date;
  status!: string;
  currency!: string;
  gym!: PaymentInvoiceGymResponseDto;
  member!: PaymentInvoiceMemberResponseDto;
  items!: PaymentInvoiceItemResponseDto[];
  subtotal!: number;
  taxRate!: number;
  taxAmount!: number;
  total!: number;
  notes?: string;
}
