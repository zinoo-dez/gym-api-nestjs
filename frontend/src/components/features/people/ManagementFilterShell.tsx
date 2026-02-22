import { ReactNode } from "react";
import { Filter } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ManagementFilterShellProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  hasActiveFilters: boolean;
  onReset: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  children: ReactNode;
  mobileTitle?: string;
}

export function ManagementFilterShell({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  hasActiveFilters,
  onReset,
  isMobile,
  mobileOpen,
  onMobileOpenChange,
  children,
  mobileTitle = "Filters",
}: ManagementFilterShellProps) {
  return (
    <>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
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

        {!isMobile ? <div className="mt-4">{children}</div> : null}
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
              <h3 className="text-lg font-semibold tracking-tight">{mobileTitle}</h3>
              <Button type="button" variant="ghost" onClick={() => onMobileOpenChange(false)}>
                Close
              </Button>
            </div>

            {children}

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
