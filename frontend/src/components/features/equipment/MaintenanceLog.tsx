import {
  MAINTENANCE_LOG_TYPE_LABELS,
  MaintenanceLogEntry,
  formatCurrency,
  formatDisplayDate,
} from "@/features/equipment";

interface MaintenanceLogProps {
  logs: MaintenanceLogEntry[];
}

export function MaintenanceLog({ logs }: MaintenanceLogProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No maintenance logs recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Description</th>
            <th className="px-3 py-2 font-medium">Cost</th>
            <th className="px-3 py-2 font-medium">Performed By</th>
            <th className="px-3 py-2 font-medium">Next Due</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
              <td className="px-3 py-2 whitespace-nowrap">{formatDisplayDate(log.date)}</td>
              <td className="px-3 py-2 whitespace-nowrap">{MAINTENANCE_LOG_TYPE_LABELS[log.type]}</td>
              <td className="px-3 py-2">{log.description}</td>
              <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(log.cost)}</td>
              <td className="px-3 py-2 whitespace-nowrap">{log.performedBy}</td>
              <td className="px-3 py-2 whitespace-nowrap">{formatDisplayDate(log.nextDueDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
