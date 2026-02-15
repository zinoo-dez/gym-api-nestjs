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

const FOOTFALL_DATA = [
  { hour: "6 AM", value: 42 },
  { hour: "8 AM", value: 78 },
  { hour: "10 AM", value: 56 },
  { hour: "12 PM", value: 89 },
  { hour: "2 PM", value: 64 },
  { hour: "4 PM", value: 95 },
  { hour: "6 PM", value: 100 },
  { hour: "8 PM", value: 73 },
];

const RECENT_CHECK_INS = [
  { name: "Ava Martinez", time: "08:14 AM", status: "Checked In" },
  { name: "Noah Patel", time: "08:22 AM", status: "Checked In" },
  { name: "Liam Johnson", time: "08:29 AM", status: "Pending" },
  { name: "Olivia Kim", time: "08:33 AM", status: "Checked In" },
  { name: "Sophia Nguyen", time: "08:37 AM", status: "Checked In" },
];

const MEMBER_SPARKLINE = [88, 92, 94, 98, 101, 106, 112];

const QUICK_ACTIONS = [
  { id: "Check-in Member", icon: CheckCircle2 },
  { id: "Add New Lead", icon: UserPlus },
  { id: "Book Class", icon: CalendarPlus },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toDateString(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toTimeString(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toDateTimeString(date) {
  return `${toDateString(date)}T${toTimeString(date)}`;
}

function parsePickerValue(value, mode) {
  if (!value) return null;

  if (mode === "date") {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  if (mode === "time") {
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    return next;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatPickerValue(date, mode) {
  if (mode === "date") return toDateString(date);
  if (mode === "time") return toTimeString(date);
  return toDateTimeString(date);
}

function formatTriggerLabel(date, mode, placeholder) {
  if (!date) return placeholder;
  if (mode === "date") {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
  if (mode === "time") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Sparkline({ values }) {
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

function GoogleDateTimePicker({
  value,
  onChange,
  mode = "datetime",
  label,
  placeholder = "Select date and time",
  className,
}) {
  const wrapperRef = useRef(null);
  const parsedValue = useMemo(() => parsePickerValue(value, mode), [value, mode]);
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(parsedValue || new Date());
  const [viewDate, setViewDate] = useState(parsedValue || new Date());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = useMemo(() => {
    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [viewDate]);

  const selectedDate = draftDate || new Date();

  const applyDay = (day) => {
    setDraftDate((current) => {
      const next = new Date(current || new Date());
      next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      return next;
    });
  };

  const setHours = (hours) => {
    setDraftDate((current) => {
      const next = new Date(current || new Date());
      next.setHours(Number(hours));
      return next;
    });
  };

  const setMinutes = (minutes) => {
    setDraftDate((current) => {
      const next = new Date(current || new Date());
      next.setMinutes(Number(minutes));
      return next;
    });
  };

  const applySelection = () => {
    if (!draftDate) return;
    onChange(formatPickerValue(draftDate, mode));
    setIsOpen(false);
  };

  const setToday = () => {
    const now = new Date();
    setDraftDate(now);
    setViewDate(now);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {label && <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>}

      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }

          const base = parsedValue || new Date();
          setDraftDate(base);
          setViewDate(base);
          setIsOpen(true);
        }}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40"
      >
        <span className="truncate">{formatTriggerLabel(parsedValue, mode, placeholder)}</span>
        <CalendarDays className="h-4 w-4 text-blue-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[320px] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
          {(mode === "date" || mode === "datetime") && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                    )
                  }
                  className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold text-gray-800">{formatMonthLabel(viewDate)}</p>
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                    )
                  }
                  className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                  const isSelected =
                    selectedDate.getDate() === day.getDate() &&
                    selectedDate.getMonth() === day.getMonth() &&
                    selectedDate.getFullYear() === day.getFullYear();

                  return (
                    <button
                      key={`${day.toDateString()}-${day.getMonth()}`}
                      type="button"
                      onClick={() => applyDay(day)}
                      className={cn(
                        "h-9 w-9 rounded-full text-sm transition",
                        isSelected && "bg-blue-600 text-white",
                        !isSelected && isCurrentMonth && "text-gray-700 hover:bg-blue-50",
                        !isCurrentMonth && "text-gray-300 hover:bg-gray-100",
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {(mode === "time" || mode === "datetime") && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-gray-500">
                Hour
                <select
                  className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                  value={selectedDate.getHours()}
                  onChange={(event) => setHours(event.target.value)}
                >
                  {Array.from({ length: 24 }, (_, value) => (
                    <option key={`hour-${value}`} value={value}>
                      {pad2(value)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-gray-500">
                Minute
                <select
                  className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                  value={selectedDate.getMinutes()}
                  onChange={(event) => setMinutes(event.target.value)}
                >
                  {Array.from({ length: 60 }, (_, value) => (
                    <option key={`minute-${value}`} value={value}>
                      {pad2(value)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={setToday}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Today
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applySelection}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
  const [globalDateTime, setGlobalDateTime] = useState(toDateTimeString(new Date()));
  const [scheduleDate, setScheduleDate] = useState(toDateString(new Date()));
  const [bookClassDateTime, setBookClassDateTime] = useState(toDateTimeString(new Date()));
  const [activeAction, setActiveAction] = useState("Check-in Member");

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
