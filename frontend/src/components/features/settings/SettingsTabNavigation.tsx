import type { LucideIcon } from "lucide-react";

import type { SettingsTabId } from "@/features/settings";
import { cn } from "@/lib/utils";

export interface SettingsTabNavigationItem {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface SettingsTabNavigationProps {
  tabs: SettingsTabNavigationItem[];
  activeTab: SettingsTabId;
  onTabChange: (tabId: SettingsTabId) => void;
}

export function SettingsTabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: SettingsTabNavigationProps) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
      <p className="meta-text uppercase tracking-wide">Settings Sections</p>

      <div
        className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
        role="tablist"
        aria-orientation="vertical"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "min-w-[220px] rounded-lg border px-4 py-3 text-left transition-colors lg:min-w-0",
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn(isActive ? "text-primary" : "text-foreground")}>{tab.label}</span>
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{tab.description}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
