import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  UserPlus,
  Users,
} from "lucide-react";
import { GoogleDateTimePicker } from "@/components/ui/google-date-time-picker";
import { cn } from "@/lib/utils";

interface FootfallData {
  hour: string;
  value: number;
}

const FOOTFALL_DATA: FootfallData[] = [
  { hour: "6 AM", value: 42 },
  { hour: "8 AM", value: 78 },
  { hour: "10 AM", value: 56 },
  { hour: "12 PM", value: 89 },
  { hour: "2 PM", value: 64 },
  { hour: "4 PM", value: 95 },
  { hour: "6 PM", value: 100 },
  { hour: "8 PM", value: 73 },
];

interface RecentCheckIn {
  name: string;
  time: string;
  status: "Checked In" | "Pending";
}

const RECENT_CHECK_INS: RecentCheckIn[] = [
  { name: "Ava Martinez", time: "08:14 AM", status: "Checked In" },
  { name: "Noah Patel", time: "08:22 AM", status: "Checked In" },
  { name: "Liam Johnson", time: "08:29 AM", status: "Pending" },
  { name: "Olivia Kim", time: "08:33 AM", status: "Checked In" },
  { name: "Sophia Nguyen", time: "08:37 AM", status: "Checked In" },
];

const MEMBER_SPARKLINE = [88, 92, 94, 98, 101, 106, 112];

interface QuickAction {
  id: string;
  icon: typeof CheckCircle2;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: "Check-in Member", icon: CheckCircle2 },
  { id: "Add New Lead", icon: UserPlus },
  { id: "Book Class", icon: CalendarPlus },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

interface SparklineProps {
  values: number[];
}

function Sparkline({ values }: SparklineProps) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const width = 120;
  const height = 34;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-28" aria-hidden="true">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-blue-500"
        points={points}
      />
    </svg>
  );
}


function GymFootfallChart() {
  const max = Math.max(...FOOTFALL_DATA.map((item) => item.value));

  return (
    <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-8">
      {FOOTFALL_DATA.map((item) => (
        <div key={item.hour} className="flex flex-col items-center gap-2">
          <div className="relative flex h-40 w-full items-end overflow-hidden rounded-xl bg-gray-100">
            <div
              className="w-full rounded-xl bg-blue-500 transition hover:bg-blue-600"
              style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-gray-500">{item.hour}</span>
        </div>
      ))}
    </div>
  );
}

export default function GymManagementM3Dashboard() {
  const [globalDateTime, setGlobalDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookClassDateTime, setBookClassDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [activeAction, setActiveAction] = useState<string>("Check-in Member");

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Operations Snapshot</p>
            <p className="text-sm text-gray-500">
              Live metrics and scheduling controls for your floor team.
            </p>
          </div>
          <GoogleDateTimePicker
            mode="datetime"
            value={globalDateTime}
            onChange={setGlobalDateTime}
            label="Global Date & Time"
            className="w-full lg:w-80"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 md:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">1,842</p>
            </div>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500">Last 7 days</p>
            <Sparkline values={MEMBER_SPARKLINE} />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 md:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Check-ins</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">128</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-xs text-gray-500">+14 members compared to this time yesterday</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 md:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue This Month</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{currency.format(68240)}</p>
            </div>
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-4 text-xs text-gray-500">11.2% growth from previous month</p>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 md:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-amber-700">Pending Renewals</p>
              <p className="mt-1 text-2xl font-semibold text-amber-900">37</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-700" />
          </div>
          <p className="mt-4 text-xs text-amber-700">12 memberships expire within 48 hours</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 md:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">Gym Footfall</p>
              <p className="text-xs text-gray-500">Peak hours analysis</p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              Today
            </span>
          </div>
          <GymFootfallChart />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 md:col-span-4">
          <p className="text-sm font-semibold text-gray-900">Quick Actions</p>
          <p className="text-xs text-gray-500">Daily tasks for front desk operations</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isActive = activeAction === action.id;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setActiveAction(action.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                    isActive
                      ? "border-blue-200 bg-blue-100 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {action.id}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Scheduling
            </p>
            <GoogleDateTimePicker
              className="mt-2"
              mode="datetime"
              value={bookClassDateTime}
              onChange={setBookClassDateTime}
              placeholder="Set class date/time"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white md:col-span-8">
          <div className="border-b border-gray-200 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">Recent Check-ins</p>
            <p className="text-xs text-gray-500">Live entrance activity</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Photo</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_CHECK_INS.map((entry) => {
                  const statusClass =
                    entry.status === "Checked In"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700";

                  return (
                    <tr key={`${entry.name}-${entry.time}`} className="border-t border-gray-200">
                      <td className="px-5 py-3 font-medium text-gray-900">{entry.name}</td>
                      <td className="px-5 py-3">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-semibold text-white">
                          {getInitials(entry.name)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{entry.time}</td>
                      <td className="px-5 py-3">
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusClass)}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 md:col-span-4">
          <p className="text-sm font-semibold text-gray-900">Mini-Calendar</p>
          <p className="text-xs text-gray-500">Jump to a date and plan staff priorities</p>
          <GoogleDateTimePicker
            className="mt-3"
            mode="date"
            value={scheduleDate}
            onChange={setScheduleDate}
            placeholder="Pick schedule date"
          />

          <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-blue-600" />
                Morning shift
              </span>
              <span>6:00 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-blue-600" />
                Group class block
              </span>
              <span>12:30 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-blue-600" />
                Evening peak watch
              </span>
              <span>6:00 PM</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
