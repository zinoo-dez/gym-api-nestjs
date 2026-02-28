import { useSyncExternalStore } from "react";

// -----------------------------------------------------------------------
// Material 3 window-size breakpoints (compact / medium / expanded).
//
// Using `matchMedia` instead of a resize listener avoids layout thrashing
// and keeps the component in sync with CSS media-query breakpoints.
// -----------------------------------------------------------------------

type Breakpoint = "compact" | "medium" | "expanded";

const MEDIUM_QUERY = "(min-width: 600px)";
const EXPANDED_QUERY = "(min-width: 840px)";

const mediumMql =
    typeof window !== "undefined" ? window.matchMedia(MEDIUM_QUERY) : null;
const expandedMql =
    typeof window !== "undefined" ? window.matchMedia(EXPANDED_QUERY) : null;

function getBreakpoint(): Breakpoint {
    if (expandedMql?.matches) return "expanded";
    if (mediumMql?.matches) return "medium";
    return "compact";
}

function subscribe(callback: () => void): () => void {
    mediumMql?.addEventListener("change", callback);
    expandedMql?.addEventListener("change", callback);
    return () => {
        mediumMql?.removeEventListener("change", callback);
        expandedMql?.removeEventListener("change", callback);
    };
}

/**
 * Returns `"compact"`, `"medium"`, or `"expanded"` based on current
 * viewport width using CSS `matchMedia` listeners:
 *
 * - < 600 px  → `"compact"`
 * - 600–839 px → `"medium"`
 * - ≥ 840 px  → `"expanded"`
 */
export function useBreakpoint(): Breakpoint {
    return useSyncExternalStore(subscribe, getBreakpoint, () => "expanded");
}
