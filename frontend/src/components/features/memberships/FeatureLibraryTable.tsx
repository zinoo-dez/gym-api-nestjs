import { MaterialIcon } from "@/components/ui/MaterialIcon";

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
      <div className="hidden overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container-low md:block">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Feature Name</th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Description</th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Status</th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Assigned Plans</th>
              <th className="px-4 py-4 text-right text-label-large font-bold text-on-surface-variant">Actions</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.id} className="border-b transition-colors hover:bg-muted/50 last:border-0">
                <td className="px-4 py-4 align-middle">
                  <div className="space-y-0.5">
                    <p className="text-title-small font-bold text-on-surface">{feature.name}</p>
                    {feature.isSystem ? (
                      <p className="text-label-small font-medium text-primary">System Feature</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-4 align-middle text-body-medium text-on-surface-variant">{feature.description || "-"}</td>
                <td className="px-4 py-4 align-middle">
                  <FeatureStatusBadge status={feature.status} />
                </td>
                <td className="px-4 py-4 align-middle text-body-medium text-on-surface font-medium">{feature.assignedPlans}</td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      onClick={() => onEdit(feature)}
                      title="Edit feature"
                    >
                      <MaterialIcon icon="edit" className="text-xl" />
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      disabled={feature.isSystem || feature.assignedPlans > 0 || deletingFeatureId === feature.id}
                      onClick={() => onDelete(feature)}
                      className="text-error hover:bg-error/10 active:bg-error/20"
                      title="Delete feature"
                    >
                      <MaterialIcon icon="delete" className="text-xl" />
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
          <article
            key={feature.id}
            className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 transition-all hover:bg-surface-container active:bg-surface-container-high"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-title-medium font-bold text-on-surface">{feature.name}</h3>
                <p className="text-label-medium text-on-surface-variant line-clamp-2">{feature.description || "No description"}</p>
              </div>
              <FeatureStatusBadge status={feature.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <dt className="text-label-small font-bold uppercase tracking-wider text-on-surface-variant/80">Assigned Plans</dt>
                <dd className="text-body-medium font-medium text-on-surface">{feature.assignedPlans}</dd>
              </div>
              <div className="space-y-0.5 text-right">
                <dt className="text-label-small font-bold uppercase tracking-wider text-on-surface-variant/80">Type</dt>
                <dd className="text-body-medium text-on-surface">{feature.isSystem ? "System" : "Custom"}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outlined"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(feature)}
              >
                <MaterialIcon icon="edit" className="text-lg" />
                <span>Edit</span>
              </Button>
              <Button
                type="button"
                variant="text"
                size="sm"
                className="flex-1 text-error hover:bg-error/10 active:bg-error/20"
                disabled={feature.isSystem || feature.assignedPlans > 0 || deletingFeatureId === feature.id}
                onClick={() => onDelete(feature)}
              >
                <MaterialIcon icon="delete" className="text-lg" />
                <span>Delete</span>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
