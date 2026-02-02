/**
 * StatsSection Component
 * Display key statistics with large numbers using StatCard
 */

import { StatCard } from "../common/StatCard";

export function StatsSection({ stats }) {
  return (
    <section className="py-16 border-y border-white/5 bg-black/20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              trendValue={stat.trendValue}
              icon={stat.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
