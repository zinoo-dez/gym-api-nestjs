import { Filter } from "lucide-react";

import {
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  COST_PAYMENT_STATUSES,
  COST_PAYMENT_STATUS_LABELS,
  COST_STATUSES,
  COST_STATUS_LABELS,
  COST_TYPES,
  COST_TYPE_LABELS,
  CostFilterState,
} from "@/features/costs";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface CostFiltersProps {
  filters: CostFilterState;
  onChange: (next: Partial<CostFilterState>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function FilterFields({
  filters,
  onChange,
}: {
  filters: CostFilterState;
  onChange: (next: Partial<CostFilterState>) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-2">
        <label htmlFor="cost-filter-category" className="text-sm font-medium text-foreground">
          Category
        </label>
        <Select
          id="cost-filter-category"
          value={filters.category}
          onChange={(event) =>
            onChange({ category: event.target.value as CostFilterState["category"] })
          }
        >
          <option value="all">All Categories</option>
          {COST_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {COST_CATEGORY_LABELS[category]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cost-filter-type" className="text-sm font-medium text-foreground">
          Cost Type
        </label>
        <Select
          id="cost-filter-type"
          value={filters.costType}
          onChange={(event) =>
            onChange({ costType: event.target.value as CostFilterState["costType"] })
          }
        >
          <option value="all">All Types</option>
          {COST_TYPES.map((type) => (
            <option key={type} value={type}>
              {COST_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cost-filter-payment-status" className="text-sm font-medium text-foreground">
          Payment Status
        </label>
        <Select
          id="cost-filter-payment-status"
          value={filters.paymentStatus}
          onChange={(event) =>
            onChange({ paymentStatus: event.target.value as CostFilterState["paymentStatus"] })
          }
        >
          <option value="all">All Payment States</option>
          {COST_PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {COST_PAYMENT_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cost-filter-status" className="text-sm font-medium text-foreground">
          Record Status
        </label>
        <Select
          id="cost-filter-status"
          value={filters.status}
          onChange={(event) =>
            onChange({ status: event.target.value as CostFilterState["status"] })
          }
        >
          <option value="all">All Record Statuses</option>
          {COST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {COST_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="cost-filter-date-from" className="text-sm font-medium text-foreground">
            Date From
          </label>
          <Input
            id="cost-filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cost-filter-date-to" className="text-sm font-medium text-foreground">
            Date To
          </label>
          <Input
            id="cost-filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(event) => onChange({ dateTo: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function CostFilters({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
  mobileOpen,
  onMobileOpenChange,
}: CostFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label htmlFor="cost-search" className="sr-only">
              Search by title, vendor, or budget group
            </label>
            <Input
              id="cost-search"
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Search by title, vendor, or budget group"
            />
          </div>

          {isMobile ? (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => onMobileOpenChange(true)}>
                <Filter className="size-4" />
                Filters
              </Button>
              <Button type="button" variant="ghost" onClick={onReset} disabled={!hasActiveFilters}>
                Reset
              </Button>
            </div>
          ) : (
            <Button type="button" variant="ghost" onClick={onReset} disabled={!hasActiveFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {!isMobile ? (
          <div className="mt-4">
            <FilterFields filters={filters} onChange={onChange} />
          </div>
        ) : null}
      </div>

      {isMobile && mobileOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => onMobileOpenChange(false)}
          />

          <section className="absolute inset-x-0 bottom-0 rounded-t-xl border-t bg-background p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Filters</h3>
              <Button type="button" variant="ghost" onClick={() => onMobileOpenChange(false)}>
                Close
              </Button>
            </div>

            <FilterFields filters={filters} onChange={onChange} />

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onReset}
                disabled={!hasActiveFilters}
              >
                Clear
              </Button>
              <Button type="button" className="flex-1" onClick={() => onMobileOpenChange(false)}>
                Apply
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
