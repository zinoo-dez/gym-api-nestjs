import { PenSquare, Trash2 } from "lucide-react";

import { FeatureLibraryRecord } from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { FeatureStatusBadge } from "@/components/features/memberships/FeatureStatusBadge";

interface FeatureLibraryTableProps {
  features: FeatureLibraryRecord[];
  deletingFeatureId?: string | null;
  onEdit: (feature: FeatureLibraryRecord) => void;
  onDelete: (feature: FeatureLibraryRecord) => void;
}

export function FeatureLibraryTable({
  features,
  deletingFeatureId,
  onEdit,
  onDelete,
}: FeatureLibraryTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Feature Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Assigned Plans</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.id} className="border-b transition-colors hover:bg-muted/50 last:border-0">
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{feature.name}</p>
                    {feature.isSystem ? (
                      <p className="text-xs text-muted-foreground">System Feature</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-foreground">{feature.description || "-"}</td>
                <td className="px-4 py-3 align-top">
                  <FeatureStatusBadge status={feature.status} />
                </td>
                <td className="px-4 py-3 align-top text-foreground">{feature.assignedPlans}</td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(feature)}>
                      <PenSquare className="size-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={feature.isSystem || feature.assignedPlans > 0 || deletingFeatureId === feature.id}
                      onClick={() => onDelete(feature)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {features.map((feature) => (
          <article key={feature.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">{feature.description || "No description"}</p>
              </div>
              <FeatureStatusBadge status={feature.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assigned Plans</dt>
                <dd className="text-foreground">{feature.assignedPlans}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</dt>
                <dd className="text-foreground">{feature.isSystem ? "System" : "Custom"}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(feature)}>
                <PenSquare className="size-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={feature.isSystem || feature.assignedPlans > 0 || deletingFeatureId === feature.id}
                onClick={() => onDelete(feature)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
