
import { useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, SecondaryButton } from "@/components/gym";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Users,
  Mail,
  Phone,
  MoreVertical,
} from "lucide-react";

interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specializations: string[];
  rating: number;
  clients: number;
  status: "active" | "inactive" | "on-leave";
  joinedDate: string;
}

const mockTrainers: Trainer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@powerfit.com",
    phone: "+1 234-567-8901",
    avatar: "/placeholder.svg?height=100&width=100",
    specializations: ["HIIT", "Cardio", "Weight Loss"],
    rating: 4.9,
    clients: 45,
    status: "active",
    joinedDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.c@powerfit.com",
    phone: "+1 234-567-8902",
    avatar: "/placeholder.svg?height=100&width=100",
    specializations: ["Yoga", "Meditation", "Flexibility"],
    rating: 4.8,
    clients: 38,
    status: "active",
    joinedDate: "2023-03-20",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.d@powerfit.com",
    phone: "+1 234-567-8903",
    avatar: "/placeholder.svg?height=100&width=100",
    specializations: ["Spin", "Cycling", "Endurance"],
    rating: 4.7,
    clients: 52,
    status: "active",
    joinedDate: "2022-11-08",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@powerfit.com",
    phone: "+1 234-567-8904",
    avatar: "/placeholder.svg?height=100&width=100",
    specializations: ["Strength", "Bodybuilding", "Powerlifting"],
    rating: 4.9,
    clients: 30,
    status: "on-leave",
    joinedDate: "2023-06-01",
  },
  {
    id: "5",
    name: "Maria Garcia",
    email: "maria.g@powerfit.com",
    phone: "+1 234-567-8905",
    avatar: "/placeholder.svg?height=100&width=100",
    specializations: ["Zumba", "Dance Fitness", "Aerobics"],
    rating: 4.6,
    clients: 60,
    status: "inactive",
    joinedDate: "2022-08-15",
  },
];

export default function AdminTrainersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredTrainers = mockTrainers.filter(
    (trainer) =>
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.specializations.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const getStatusBadge = (status: Trainer["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Active
          </Badge>
        );
      case "on-leave":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            On Leave
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            Inactive
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
              Trainer Management
            </h1>
            <p className="text-muted-foreground">
              Manage your gym trainers and staff
            </p>
          </div>
          <PrimaryButton>
            <Plus className="mr-2 h-4 w-4" />
            Add New Trainer
          </PrimaryButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockTrainers.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Trainers</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {(
                    mockTrainers.reduce((acc, t) => acc + t.rating, 0) /
                    mockTrainers.length
                  ).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
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
                  {mockTrainers.reduce((acc, t) => acc + t.clients, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Users className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockTrainers.filter((t) => t.status === "on-leave").length}
                </p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trainers or specializations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <SecondaryButton
              size="sm"
              className={viewMode === "grid" ? "bg-primary/20" : ""}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </SecondaryButton>
            <SecondaryButton
              size="sm"
              className={viewMode === "list" ? "bg-primary/20" : ""}
              onClick={() => setViewMode("list")}
            >
              List
            </SecondaryButton>
          </div>
        </div>

        {/* Trainers Grid */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                      <img
                        src={trainer.avatar || "/placeholder.svg"}
                        alt={trainer.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {trainer.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {trainer.rating} ({trainer.clients} clients)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {trainer.specializations.map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {trainer.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {trainer.phone}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {getStatusBadge(trainer.status)}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Edit trainer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete trainer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Trainer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Specializations
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Rating
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
                  {filteredTrainers.map((trainer) => (
                    <tr
                      key={trainer.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                            <img
                              src={trainer.avatar || "/placeholder.svg"}
                              alt={trainer.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {trainer.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {trainer.clients} clients
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-foreground">{trainer.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {trainer.phone}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {trainer.specializations.slice(0, 2).map((spec) => (
                            <Badge
                              key={spec}
                              variant="secondary"
                              className="bg-muted text-muted-foreground text-xs"
                            >
                              {spec}
                            </Badge>
                          ))}
                          {trainer.specializations.length > 2 && (
                            <Badge
                              variant="secondary"
                              className="bg-muted text-muted-foreground text-xs"
                            >
                              +{trainer.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-foreground">
                            {trainer.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(trainer.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Edit trainer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Delete trainer"
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
        )}
      </div>
    </AdminLayout>
  );
}
