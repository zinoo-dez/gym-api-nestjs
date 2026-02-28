import api from './api';
import type { ApiEnvelope } from './api.types';

import { CostFormValues, CostRecord, sanitizeCostRecord, sortCostRecords } from '@/features/costs';

const sortForDisplay = (records: CostRecord[]): CostRecord[] => {
    return sortCostRecords(records, {
        field: 'costDate',
        direction: 'desc',
    });
};

const toCostPayload = (values: CostFormValues, performedBy: string) => ({
    title: values.title,
    category: values.category,
    costType: values.costType,
    amount: values.amount,
    taxAmount: values.taxAmount,
    paymentMethod: values.paymentMethod,
    billingPeriod: values.billingPeriod,
    costDate: values.costDate,
    dueDate: values.dueDate,
    paidDate: values.paidDate || undefined,
    paymentStatus: values.paymentStatus,
    budgetGroup: values.budgetGroup,
    vendor: values.vendor,
    referenceNumber: values.referenceNumber,
    notes: values.notes,
    createdBy: performedBy,
    status: values.status,
});

const toRecord = (record: CostRecord): CostRecord => sanitizeCostRecord(record);

export const costService = {
    async listCosts(): Promise<CostRecord[]> {
        const response = await api.get<ApiEnvelope<CostRecord[]>>('/costs');
        return sortForDisplay((response.data.data ?? []).map(toRecord));
    },

    async getCostById(id: string): Promise<CostRecord> {
        const response = await api.get<ApiEnvelope<CostRecord>>(`/costs/${id}`);
        return toRecord(response.data.data);
    },

    async createCost(values: CostFormValues, performedBy: string): Promise<CostRecord> {
        const response = await api.post<ApiEnvelope<CostRecord>>(
            '/costs',
            toCostPayload(values, performedBy),
        );
        return toRecord(response.data.data);
    },

    async updateCost(id: string, values: CostFormValues, performedBy: string): Promise<CostRecord> {
        const response = await api.patch<ApiEnvelope<CostRecord>>(
            `/costs/${id}`,
            toCostPayload(values, performedBy),
        );
        return toRecord(response.data.data);
    },

    async archiveCost(id: string, _performedBy: string): Promise<CostRecord> {
        const response = await api.post<ApiEnvelope<CostRecord>>(`/costs/${id}/archive`);
        return toRecord(response.data.data);
    },

    async restoreCost(id: string, _performedBy: string): Promise<CostRecord> {
        const response = await api.post<ApiEnvelope<CostRecord>>(`/costs/${id}/restore`);
        return toRecord(response.data.data);
    },

    async duplicateCost(id: string, _performedBy: string): Promise<CostRecord> {
        const response = await api.post<ApiEnvelope<CostRecord>>(`/costs/${id}/duplicate`);
        return toRecord(response.data.data);
    },
};
