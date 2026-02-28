import { useEffect, useMemo, useState } from "react";

import { SalesHistorySection } from "@/components/features/product-sales";
import { toErrorMessage } from "@/features/product-sales";
import { useSalesHistoryQuery } from "@/hooks/use-product-sales";

export function ProductSalesHistoryPage() {
    const [salesSearchInput, setSalesSearchInput] = useState("");
    const [salesSearch, setSalesSearch] = useState("");
    const [salesHistoryPage, setSalesHistoryPage] = useState(1);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSalesSearch(salesSearchInput.trim());
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [salesSearchInput]);

    useEffect(() => {
        setSalesHistoryPage(1);
    }, [salesSearch]);

    const salesHistoryFilters = useMemo(
        () => ({
            page: salesHistoryPage,
            limit: 12,
            search: salesSearch || undefined,
        }),
        [salesHistoryPage, salesSearch],
    );

    const salesHistoryQuery = useSalesHistoryQuery(salesHistoryFilters);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-foreground">Sales History</h1>
            </header>

            <SalesHistorySection
                sectionId="products-history"
                searchInput={salesSearchInput}
                onSearchInputChange={setSalesSearchInput}
                loading={salesHistoryQuery.isLoading}
                errorMessage={salesHistoryQuery.isError ? toErrorMessage(salesHistoryQuery.error) : null}
                onRetry={() => void salesHistoryQuery.refetch()}
                sales={salesHistoryQuery.data?.data ?? []}
                currentPage={salesHistoryQuery.data?.page ?? 1}
                totalPages={salesHistoryQuery.data?.totalPages ?? 1}
                onPreviousPage={() => setSalesHistoryPage((current) => Math.max(current - 1, 1))}
                onNextPage={() =>
                    setSalesHistoryPage((current) => {
                        const totalPages = salesHistoryQuery.data?.totalPages ?? 1;
                        return Math.min(current + 1, totalPages);
                    })
                }
            />
        </div>
    );
}
