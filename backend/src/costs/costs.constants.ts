export const COST_CATEGORIES = [
  'rent',
  'utilities',
  'salaries',
  'equipment',
  'maintenance',
  'marketing',
  'software',
  'other',
] as const;

export const COST_TYPES = ['fixed', 'variable'] as const;

export const COST_PAYMENT_METHODS = ['cash', 'bank', 'card', 'online'] as const;

export const COST_PAYMENT_STATUSES = ['pending', 'paid', 'overdue'] as const;

export const COST_BILLING_PERIODS = [
  'one_time',
  'monthly',
  'quarterly',
  'yearly',
] as const;

export const COST_STATUSES = ['active', 'archived'] as const;
