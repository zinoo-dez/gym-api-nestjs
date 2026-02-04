
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, SecondaryButton } from "@/components/gym";
import { Badge } from "@/components/ui/badge";
import { trainersService, type Trainer } from "@/services/trainers.service";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Users,
  Mail,
  MoreVertical,
} from "lucide-react";

export default function AdminTrainersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrainers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await trainersService.getAll({ limit: 50 });
        setTrainers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error loading trainers:", err);
        setError("Failed to load trainers.");
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainers();
  }, []);

  const filteredTrainers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return trainers.filter((trainer) => {
      const name = `${trainer.firstName} ${trainer.lastName}`.toLowerCase();
      const matchesName = name.includes(query);
      const matchesSpecialization = trainer.specializations.some((spec) =>
        spec.toLowerCase().includes(query),
      );
      return matchesName || matchesSpecialization;
    });
  }, [trainers, searchQuery]);

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30">
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground border-border">
        Inactive
      </Badge>
    );
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
                  {trainers.length}
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
                  {trainers.length ? "—" : "—"}
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
                  —
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
                  —
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
            {loading ? (
              <div className="col-span-full text-center text-muted-foreground">
                Loading trainers...
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-destructive">
                {error}
              </div>
            ) : filteredTrainers.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground">
                No trainers found.
              </div>
            ) : (
            filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                      <img
                        src="/placeholder.svg"
                        alt={`${trainer.firstName} ${trainer.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {trainer.firstName} {trainer.lastName}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        —
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
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {getStatusBadge(trainer.isActive)}
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
            )))}
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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        Loading trainers...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-destructive">
                        {error}
                      </td>
                    </tr>
                  ) : filteredTrainers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No trainers found.
                      </td>
                    </tr>
                  ) : (
                  filteredTrainers.map((trainer) => (
                    <tr
                      key={trainer.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                            <img
                              src="/placeholder.svg"
                              alt={`${trainer.firstName} ${trainer.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {trainer.firstName} {trainer.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              —
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
                            —
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(trainer.isActive)}
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
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
