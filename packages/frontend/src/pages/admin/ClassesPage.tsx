
import { useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, SecondaryButton } from "@/components/gym";
import { Badge } from "@/components/ui/badge";
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

interface GymClass {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
  time: string;
  duration: string;
  capacity: number;
  enrolled: number;
  status: "active" | "cancelled" | "full";
  category: string;
}

const mockClasses: GymClass[] = [
  {
    id: "1",
    name: "Morning HIIT",
    instructor: "Sarah Johnson",
    schedule: "Mon, Wed, Fri",
    time: "6:00 AM",
    duration: "45 min",
    capacity: 20,
    enrolled: 18,
    status: "active",
    category: "Cardio",
  },
  {
    id: "2",
    name: "Power Yoga",
    instructor: "Mike Chen",
    schedule: "Tue, Thu",
    time: "7:00 AM",
    duration: "60 min",
    capacity: 15,
    enrolled: 15,
    status: "full",
    category: "Yoga",
  },
  {
    id: "3",
    name: "Spin Class",
    instructor: "Emily Davis",
    schedule: "Mon, Wed, Fri",
    time: "5:30 PM",
    duration: "45 min",
    capacity: 25,
    enrolled: 22,
    status: "active",
    category: "Cardio",
  },
  {
    id: "4",
    name: "Strength Training",
    instructor: "James Wilson",
    schedule: "Tue, Thu, Sat",
    time: "10:00 AM",
    duration: "60 min",
    capacity: 12,
    enrolled: 8,
    status: "active",
    category: "Strength",
  },
  {
    id: "5",
    name: "Zumba",
    instructor: "Maria Garcia",
    schedule: "Sat, Sun",
    time: "9:00 AM",
    duration: "50 min",
    capacity: 30,
    enrolled: 0,
    status: "cancelled",
    category: "Dance",
  },
];

export default function AdminClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredClasses = mockClasses.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      cls.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: GymClass["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Active
          </Badge>
        );
      case "full":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            Full
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            Cancelled
          </Badge>
        );
    }
  };

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
                  {mockClasses.length}
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
                  {mockClasses.reduce((acc, cls) => acc + cls.enrolled, 0)}
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
                  {mockClasses.filter((c) => c.status === "full").length}
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
                  {mockClasses.filter((c) => c.status === "cancelled").length}
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
                {filteredClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {cls.category} - {cls.duration}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {cls.instructor}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-foreground">{cls.schedule}</p>
                        <p className="text-sm text-muted-foreground">
                          {cls.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${(cls.enrolled / cls.capacity) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {cls.enrolled}/{cls.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(cls.status)}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
