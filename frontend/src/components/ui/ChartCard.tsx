import * as React from "react";
import { AnimatedCard } from "./AnimatedCard";
import { CardHeader, CardTitle, CardContent } from "./Card";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, children, className, action }: ChartCardProps) {
  return (
    <AnimatedCard className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </AnimatedCard>
  );
}
