import * as React from "react";
import { AnimatedCard } from "./AnimatedCard";
import { CardContent } from "./Card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon: LucideIcon;
    className?: string;
}

export function KPICard({ title, value, trend, icon: Icon, className }: KPICardProps) {
    return (
        <AnimatedCard className={className}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">{value}</h2>
                            {trend && (
                                <span
                                    className={cn(
                                        "text-xs font-semibold",
                                        trend.isPositive ? "text-success" : "text-destructive"
                                    )}
                                >
                                    {trend.isPositive ? "↑" : "↓"} {trend.value}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-6" />
                    </div>
                </div>
            </CardContent>
        </AnimatedCard>
    );
}
