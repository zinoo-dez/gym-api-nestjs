import { Filter } from "lucide-react";

import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_CONDITION_LABELS,
  MAINTENANCE_DUE_FILTERS,
  MAINTENANCE_DUE_FILTER_LABELS,
  EquipmentFilterState,
} from "@/features/equipment";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface EquipmentFiltersProps {
  filters: EquipmentFilterState;
  onChange: (next: Partial<EquipmentFilterState>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function FilterFields({
  filters,
  onChange,
}: {
  filters: EquipmentFilterState;
  onChange: (next: Partial<EquipmentFilterState>) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="space-y-2">
        <label htmlFor="filter-condition" className="text-sm font-medium text-foreground">
          Condition
        </label>
        <Select
          id="filter-condition"
          value={filters.condition}
          onChange={(event) =>
            onChange({ condition: event.target.value as EquipmentFilterState["condition"] })
          }
        >
          <option value="all">All Conditions</option>
          {EQUIPMENT_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {EQUIPMENT_CONDITION_LABELS[condition]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="filter-category" className="text-sm font-medium text-foreground">
          Category
        </label>
        <Select
          id="filter-category"
          value={filters.category}
          onChange={(event) =>
            onChange({ category: event.target.value as EquipmentFilterState["category"] })
          }
        >
          <option value="all">All Categories</option>
          {EQUIPMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {EQUIPMENT_CATEGORY_LABELS[category]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="filter-maintenance" className="text-sm font-medium text-foreground">
          Maintenance Due
        </label>
        <Select
          id="filter-maintenance"
          value={filters.maintenanceDue}
          onChange={(event) =>
            onChange({
              maintenanceDue: event.target.value as EquipmentFilterState["maintenanceDue"],
            })
          }
        >
          {MAINTENANCE_DUE_FILTERS.map((filter) => (
            <option key={filter} value={filter}>
              {MAINTENANCE_DUE_FILTER_LABELS[filter]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export function EquipmentFilters({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
  mobileOpen,
  onMobileOpenChange,
}: EquipmentFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label htmlFor="equipment-search" className="sr-only">
              Search equipment by name or category
            </label>
            <Input
              id="equipment-search"
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Search by name or category"
            />
          </div>

          {isMobile ? (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => onMobileOpenChange(true)}>
                <Filter className="size-4" />
                Filters
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onReset}
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              disabled={!hasActiveFilters}
            >
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
              <Button
                type="button"
                className="flex-1"
                onClick={() => onMobileOpenChange(false)}
              >
                Apply
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
