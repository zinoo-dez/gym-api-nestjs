import {
  COST_SEED,
  CostFormValues,
  CostRecord,
  CostRecordInput,
  archiveCostRecord,
  buildCostRecordFromForm,
  getDuplicateCostFormValues,
  restoreCostRecord,
  sanitizeCostRecord,
  sortCostRecords,
  updateCostRecordFromForm,
} from "@/features/costs";

const STORAGE_KEY = "gym-owner-cost-records-v1";

const cloneRecords = (records: CostRecord[]): CostRecord[] =>
  records.map((record) => ({
    ...record,
    auditTrail: record.auditTrail.map((entry) => ({ ...entry })),
  }));

const initialSeed = (): CostRecord[] => cloneRecords(COST_SEED);

const sortForDisplay = (records: CostRecord[]): CostRecord[] => {
  return sortCostRecords(records, {
    field: "costDate",
    direction: "desc",
  });
};

const readRecords = (): CostRecord[] => {
  if (typeof window === "undefined") {
    return initialSeed();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seed = initialSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as CostRecordInput[];
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid costs payload");
    }

    return parsed.map((record) => sanitizeCostRecord(record));
  } catch (error) {
    console.warn("Failed to parse local cost data. Resetting to seed.", error);
    const seed = initialSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

const writeRecords = (records: CostRecord[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const upsert = (record: CostRecord): CostRecord => sanitizeCostRecord(record);

const findOrThrow = (records: CostRecord[], id: string): CostRecord => {
  const existing = records.find((record) => record.id === id);
  if (!existing) {
    throw new Error("Cost record not found.");
  }

  return existing;
};

export const costService = {
  async listCosts(): Promise<CostRecord[]> {
    const records = readRecords().map(upsert);
    return sortForDisplay(records);
  },

  async getCostById(id: string): Promise<CostRecord> {
    const records = readRecords();
    return upsert(findOrThrow(records, id));
  },

  async createCost(values: CostFormValues, performedBy: string): Promise<CostRecord> {
    const records = readRecords();
    const created = upsert(buildCostRecordFromForm(values, performedBy));

    const next = [created, ...records];
    writeRecords(next);

    return created;
  },

  async updateCost(id: string, values: CostFormValues, performedBy: string): Promise<CostRecord> {
    const records = readRecords();
    const existing = findOrThrow(records, id);

    const updated = upsert(updateCostRecordFromForm(existing, values, performedBy));

    const next = records.map((record) => (record.id === id ? updated : record));
    writeRecords(next);

    return updated;
  },

  async archiveCost(id: string, performedBy: string): Promise<CostRecord> {
    const records = readRecords();
    const existing = findOrThrow(records, id);

    const updated = upsert(archiveCostRecord(existing, performedBy));

    const next = records.map((record) => (record.id === id ? updated : record));
    writeRecords(next);

    return updated;
  },

  async restoreCost(id: string, performedBy: string): Promise<CostRecord> {
    const records = readRecords();
    const existing = findOrThrow(records, id);

    const updated = upsert(restoreCostRecord(existing, performedBy));

    const next = records.map((record) => (record.id === id ? updated : record));
    writeRecords(next);

    return updated;
  },

  async duplicateCost(id: string, performedBy: string): Promise<CostRecord> {
    const records = readRecords();
    const existing = findOrThrow(records, id);
    const duplicateValues = getDuplicateCostFormValues(existing, performedBy);

    const created = upsert(buildCostRecordFromForm(duplicateValues, performedBy));
    const next = [created, ...records];
    writeRecords(next);

    return created;
  },
};
