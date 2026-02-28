import { Download, Printer } from "lucide-react";
import { goeyToast } from "goey-toast";

import {
    toPaymentErrorMessage,
    useDownloadInvoicePdfMutation,
    usePaymentInvoiceQuery,
} from "@/hooks/use-payments";
import { Button } from "@/components/ui/Button";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date-utils";
import type { PaymentInvoice, PaymentInvoiceItem } from "@/services/payments.service";

interface InvoiceViewPanelProps {
    open: boolean;
    onClose: () => void;
    invoiceId: string | null;
    isMobile: boolean;
}

const formatInvoiceStatus = (status: string): string => {
    const normalized = status.trim().toUpperCase();

    if (normalized.length === 0) {
        return "Unknown";
    }

    return normalized
        .split("_")
        .filter((segment) => segment.length > 0)
        .map((segment) => `${segment[0]}${segment.slice(1).toLowerCase()}`)
        .join(" ");
};

const invoiceStatusClass = (status: string): string => {
    const normalized = status.trim().toUpperCase();

    if (normalized === "PAID" || normalized === "SUCCESS") {
        return "bg-success/20 text-success";
    }

    if (normalized === "OVERDUE" || normalized === "FAILED") {
        return "bg-danger/20 text-destructive";
    }

    if (normalized === "PENDING" || normalized === "OPEN" || normalized === "DRAFT") {
        return "bg-warning/20 text-warning";
    }

    return "bg-secondary text-secondary-foreground";
};

const invoiceItemColumns: DataTableColumn<PaymentInvoiceItem>[] = [
    { id: "description", label: "Description", render: (row) => row.description },
    { id: "quantity", label: "Qty", align: "right", render: (row) => row.quantity },
    { id: "unitPrice", label: "Unit Price", align: "right", render: (row) => formatCurrency(row.unitPrice) },
    { id: "lineTotal", label: "Line Total", align: "right", render: (row) => <span className="font-medium">{formatCurrency(row.lineTotal)}</span> },
];

const escapeHtml = (value: string): string =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

const buildPrintableInvoiceDocument = (invoice: PaymentInvoice): string => {
    const rows = invoice.items
        .map(
            (item) => `
        <tr>
          <td>${escapeHtml(item.description)}</td>
          <td style="text-align: right;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
          <td style="text-align: right;">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `,
        )
        .join("\n");

    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    body {
      font-family: Inter, Arial, sans-serif;
      color: #111827;
      margin: 32px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .meta {
      text-align: right;
      font-size: 12px;
      color: #4b5563;
    }
    .section {
      margin-bottom: 16px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    th,
    td {
      border: 1px solid #e5e7eb;
      padding: 10px;
    }
    th {
      background: #f9fafb;
      text-align: left;
      color: #6b7280;
    }
    .totals {
      width: 320px;
      margin-left: auto;
      font-size: 14px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .total {
      border-top: 1px solid #d1d5db;
      padding-top: 10px;
      font-weight: 700;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <header class="header">
    <div>
      <h1>${escapeHtml(invoice.gym.name)}</h1>
      <div class="section">${escapeHtml(invoice.gym.address ?? "")}</div>
      <div class="section">${escapeHtml(invoice.gym.email ?? "")}</div>
      <div class="section">${escapeHtml(invoice.gym.phone ?? "")}</div>
    </div>
    <div class="meta">
      <div><strong>Invoice #</strong> ${escapeHtml(invoice.invoiceNumber)}</div>
      <div><strong>Issued</strong> ${escapeHtml(formatDate(invoice.issuedAt))}</div>
      <div><strong>Due</strong> ${escapeHtml(formatDate(invoice.dueAt))}</div>
      <div><strong>Status</strong> ${escapeHtml(formatInvoiceStatus(invoice.status))}</div>
    </div>
  </header>

  <section class="section">
    <div><strong>Billed To:</strong> ${escapeHtml(invoice.member.name)}</div>
    <div>${escapeHtml(invoice.member.email ?? "")}</div>
    <div>${escapeHtml(invoice.member.phone ?? "")}</div>
  </section>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <section class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
    <div class="totals-row"><span>Tax</span><span>${formatCurrency(invoice.taxAmount)}</span></div>
    <div class="totals-row total"><span>Grand Total</span><span>${formatCurrency(invoice.total)}</span></div>
  </section>

  <script>
    window.onload = function () {
      window.print();
    };
  </script>
</body>
</html>
`;
};

export function InvoiceViewPanel({ open, onClose, invoiceId, isMobile }: InvoiceViewPanelProps) {
    const invoiceQuery = usePaymentInvoiceQuery(invoiceId, open);
    const downloadPdfMutation = useDownloadInvoicePdfMutation();

    const invoice = invoiceQuery.data;

    const handleDownloadPdf = async () => {
        if (!invoiceId) {
            return;
        }

        try {
            const file = await downloadPdfMutation.mutateAsync(invoiceId);
            const objectUrl = window.URL.createObjectURL(file.blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = file.filename;
            document.body.append(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            goeyToast.error(toPaymentErrorMessage(error));
        }
    };

    const handlePrint = () => {
        if (!invoice) {
            return;
        }

        const printWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=900");

        if (!printWindow) {
            goeyToast.error("Unable to open print preview. Check pop-up permissions and retry.");
            return;
        }

        printWindow.document.write(buildPrintableInvoiceDocument(invoice));
        printWindow.document.close();
    };

    const footer = (
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handlePrint} disabled={!invoice}>
                <Printer className="size-4" />
                Print
            </Button>

            <Button
                type="button"
                onClick={() => void handleDownloadPdf()}
                disabled={!invoice || downloadPdfMutation.isPending}
            >
                <Download className="size-4" />
                {downloadPdfMutation.isPending ? "Preparing..." : "Download PDF"}
            </Button>
        </div>
    );

    return (
        <SlidePanel
            open={open}
            onClose={onClose}
            isMobile={isMobile}
            title="Invoice"
            description="Professional receipt view with tax breakdown and printable output"
            footer={footer}
            className="max-w-3xl"
        >
            {invoiceQuery.isLoading ? (
                <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    Loading invoice details...
                </div>
            ) : null}

            {invoiceQuery.isError ? (
                <div className="space-y-3 rounded-lg border border-destructive/40 bg-danger/5 p-4">
                    <p className="text-sm text-destructive">{toPaymentErrorMessage(invoiceQuery.error)}</p>
                    <Button type="button" variant="outline" onClick={() => void invoiceQuery.refetch()}>
                        Retry
                    </Button>
                </div>
            ) : null}

            {invoice ? (
                <div className="space-y-6">
                    <header className="rounded-lg border bg-card p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold tracking-tight text-foreground">{invoice.gym.name}</h3>
                                <p className="text-sm text-muted-foreground">{invoice.gym.address || "Gym invoice office"}</p>
                                <p className="text-sm text-muted-foreground">{invoice.gym.email || "billing@gym.local"}</p>
                            </div>

                            <div className="space-y-1 text-right text-sm">
                                <p className="font-medium text-foreground">Invoice #{invoice.invoiceNumber}</p>
                                <p className="text-muted-foreground">Issued: {formatDate(invoice.issuedAt)}</p>
                                <p className="text-muted-foreground">Due: {formatDate(invoice.dueAt) || "-"}</p>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoiceStatusClass(invoice.status)}`}
                                >
                                    {formatInvoiceStatus(invoice.status)}
                                </span>
                            </div>
                        </div>
                    </header>

                    <section className="rounded-lg border bg-card p-4">
                        <h4 className="text-lg font-semibold tracking-tight">Member Details</h4>
                        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                            <p className="text-foreground">
                                <span className="text-muted-foreground">Name:</span> {invoice.member.name}
                            </p>
                            <p className="text-foreground">
                                <span className="text-muted-foreground">Member ID:</span> {invoice.member.id}
                            </p>
                            <p className="text-foreground">
                                <span className="text-muted-foreground">Email:</span> {invoice.member.email || "-"}
                            </p>
                            <p className="text-foreground">
                                <span className="text-muted-foreground">Phone:</span> {invoice.member.phone || "-"}
                            </p>
                        </div>
                    </section>

                    <section className="rounded-lg border bg-card p-4">
                        <h4 className="text-lg font-semibold tracking-tight">Itemized Charges</h4>
                        <div className="mt-3">
                            <DataTable<PaymentInvoiceItem>
                                columns={invoiceItemColumns}
                                rows={invoice.items}
                                rowKey={(row) => row.id}
                                minWidth="640px"
                            />
                        </div>

                        <div className="mt-4 ml-auto w-full max-w-sm space-y-2 rounded-md border bg-muted/20 p-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Tax {invoice.taxRate > 0 ? `(${invoice.taxRate}%)` : ""}
                                </span>
                                <span className="text-foreground">{formatCurrency(invoice.taxAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-2">
                                <span className="font-semibold text-foreground">Total</span>
                                <span className="text-lg font-semibold text-foreground">{formatCurrency(invoice.total)}</span>
                            </div>
                        </div>

                        {invoice.notes ? (
                            <p className="mt-4 rounded-md border border-info/40 bg-info/5 p-3 text-sm text-foreground">
                                <span className="font-medium">Notes:</span> {invoice.notes}
                            </p>
                        ) : null}
                    </section>
                </div>
            ) : null}
        </SlidePanel>
    );
}
