import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type RibbonTone = "success" | "warning" | "danger" | "info";

const toneStyles: Record<RibbonTone, { icon: string; border: string }> = {
    success: {
        icon: "bg-success/10 text-success",
        border: "border-success",
    },
    warning: {
        icon: "bg-destructive/10 text-destructive",
        border: "border-destructive/50",
    },
    danger: {
        icon: "bg-destructive text-destructive-foreground",
        border: "border-destructive",
    },
    info: {
        icon: "bg-secondary text-secondary-foreground",
        border: "border-secondary",
    },
};

interface FinancialSummaryRibbonProps {
    title: string;
    value: string;
    icon: string;
    tone: RibbonTone;
}

export function FinancialSummaryRibbon({
    title,
    value,
    icon,
    tone,
}: FinancialSummaryRibbonProps) {
    const style = toneStyles[tone];

    return (
        <Card className={cn("border-l-4 overflow-hidden rounded-2xl bg-card transition-all hover:bg-card hover:shadow-md", style.border)}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-1.5 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground line-clamp-1">{title}</p>
                    <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
                </div>

                <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm", style.icon)}>
                    <MaterialIcon icon={icon} className="text-2xl" />
                </div>
            </CardContent>
        </Card>
    );
}
