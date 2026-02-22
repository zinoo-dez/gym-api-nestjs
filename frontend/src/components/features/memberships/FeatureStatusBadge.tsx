import {
  FEATURE_LIBRARY_STATUS_BADGE_STYLES,
  FEATURE_LIBRARY_STATUS_LABELS,
  FeatureLibraryStatus,
} from "@/features/memberships";

interface FeatureStatusBadgeProps {
  status: FeatureLibraryStatus;
}

export function FeatureStatusBadge({ status }: FeatureStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${FEATURE_LIBRARY_STATUS_BADGE_STYLES[status]}`}
    >
      {FEATURE_LIBRARY_STATUS_LABELS[status]}
    </span>
  );
}
