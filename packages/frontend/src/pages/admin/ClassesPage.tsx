
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton } from "@/components/gym";
import { Badge } from "@/components/ui/badge";
import { classesService, type ClassSchedule } from "@/services/classes.service";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Clock,
  Calendar,
  Filter,
} from "lucide-react";

export default function AdminClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await classesService.getAll({ limit: 50 });
        setClasses(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error loading classes:", err);
        setError("Failed to load classes.");
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return classes.filter((cls) => {
      const matchesSearch =
        cls.name.toLowerCase().includes(query) ||
        (cls.trainerName || "").toLowerCase().includes(query);
      const matchesCategory =
        filterCategory === "all" ||
        cls.classType.toLowerCase() === filterCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [classes, searchQuery, filterCategory]);

  const getStatusBadge = (cls: ClassSchedule) => {
    const enrolled = cls.availableSlots !== undefined
      ? cls.capacity - cls.availableSlots
      : 0;
    if (!cls.isActive) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          Cancelled
        </Badge>
      );
    }
    if (enrolled >= cls.capacity) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
          Full
        </Badge>
      );
    }
    return (
      <Badge className="bg-primary/20 text-primary border-primary/30">
        Active
      </Badge>
    );
  };

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Class Management
            </h1>
            <p className="text-muted-foreground">
              Manage gym classes and schedules
            </p>
          </div>
          <PrimaryButton>
            <Plus className="mr-2 h-4 w-4" />
            Add New Class
          </PrimaryButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.reduce(
                    (acc, cls) =>
                      acc +
                      (cls.availableSlots !== undefined
                        ? cls.capacity - cls.availableSlots
                        : 0),
                    0,
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.filter(
                    (cls) =>
                      cls.availableSlots !== undefined &&
                      cls.capacity - cls.availableSlots >= cls.capacity,
                  ).length}
                </p>
                <p className="text-sm text-muted-foreground">Full Classes</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.filter((cls) => !cls.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search classes or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="yoga">Yoga</option>
              <option value="dance">Dance</option>
            </select>
          </div>
        </div>

        {/* Classes Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Class
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Instructor
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Schedule
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Capacity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Loading classes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No classes found.
                    </td>
                  </tr>
                ) : (
                filteredClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {cls.classType} - {cls.duration} min
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {cls.trainerName || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-foreground">{formatDate(cls.schedule)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(cls.schedule)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${
                                cls.availableSlots !== undefined
                                  ? ((cls.capacity - cls.availableSlots) / cls.capacity) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {cls.availableSlots !== undefined
                            ? cls.capacity - cls.availableSlots
                            : 0}
                          /{cls.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(cls)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit class"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete class"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
