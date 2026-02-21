import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { classesService, type ClassPackage, type ClassSchedule } from "@/services/classes.service";
import { trainersService } from "@/services/trainers.service";
import { toast } from "sonner";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const ClassesManagement = () => {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [packages, setPackages] = useState<ClassPackage[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editClassDialogOpen, setEditClassDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const [classForm, setClassForm] = useState({
    name: "",
    description: "",
    trainerId: "",
    schedule: "",
    duration: 60,
    capacity: 20,
    classType: "General",
  });

  const [editClassForm, setEditClassForm] = useState({
    name: "",
    description: "",
    trainerId: "",
    schedule: "",
    duration: 60,
    capacity: 20,
    classType: "General",
  });

  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    passType: "BUNDLE",
    classId: "",
    creditsIncluded: 10,
    price: 0,
    validityDays: 30,
    monthlyUnlimited: false,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [classesRes, bookingsRes, waitlistRes, packagesRes, trainersRes] = await Promise.all([
        classesService.getAll({ page: 1, limit: 200 }),
        classesService.getAllBookings(selectedScheduleId === "all" ? undefined : selectedScheduleId),
        classesService.getAllWaitlist(selectedScheduleId === "all" ? undefined : selectedScheduleId),
        classesService.getClassPackages(),
        trainersService.getAll({ limit: 200 }),
      ]);

      setClasses(Array.isArray(classesRes?.data) ? classesRes.data : []);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      setWaitlist(Array.isArray(waitlistRes) ? waitlistRes : []);
      setPackages(Array.isArray(packagesRes) ? packagesRes : []);
      setTrainers(Array.isArray(trainersRes?.data) ? trainersRes.data : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load classes management data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedScheduleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const bookingStats = useMemo(() => {
    const confirmed = bookings.filter((item) => item.status === "CONFIRMED").length;
    const cancelled = bookings.filter((item) => item.status === "CANCELLED").length;
    return { confirmed, cancelled, total: bookings.length };
  }, [bookings]);

  const waitlistStats = useMemo(() => {
    const waiting = waitlist.filter((item) => item.status === "waiting").length;
    const promoted = waitlist.filter((item) => item.status === "promoted").length;
    return { waiting, promoted, total: waitlist.length };
  }, [waitlist]);

  const handleCreateClass = async () => {
    if (!classForm.name.trim() || !classForm.trainerId || !classForm.schedule) {
      toast.error("Class name, trainer and schedule are required");
      return;
    }

    try {
      await classesService.create({
        name: classForm.name.trim(),
        description: classForm.description.trim() || undefined,
        trainerId: classForm.trainerId,
        schedule: new Date(classForm.schedule).toISOString(),
        duration: Number(classForm.duration),
        capacity: Number(classForm.capacity),
        classType: classForm.classType.trim() || "General",
      });
      toast.success("Class created");
      setClassDialogOpen(false);
      setClassForm({
        name: "",
        description: "",
        trainerId: "",
        schedule: "",
        duration: 60,
        capacity: 20,
        classType: "General",
      });
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create class");
    }
  };

  const handleDeactivateClass = async (id: string) => {
    try {
      await classesService.deactivate(id);
      toast.success("Class deactivated");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to deactivate class");
    }
  };

  const openEditClass = (item: ClassSchedule) => {
    setEditingScheduleId(item.id);
    setEditClassForm({
      name: item.name,
      description: item.description || "",
      trainerId: item.trainerId,
      schedule: item.schedule ? new Date(item.schedule).toISOString().slice(0, 16) : "",
      duration: item.duration,
      capacity: item.capacity,
      classType: item.classType,
    });
    setEditClassDialogOpen(true);
  };

  const handleUpdateClass = async () => {
    if (!editingScheduleId) return;
    if (!editClassForm.name.trim() || !editClassForm.trainerId || !editClassForm.schedule) {
      toast.error("Class name, trainer and schedule are required");
      return;
    }

    try {
      await classesService.update(editingScheduleId, {
        name: editClassForm.name.trim(),
        description: editClassForm.description.trim() || undefined,
        trainerId: editClassForm.trainerId,
        schedule: new Date(editClassForm.schedule).toISOString(),
        duration: Number(editClassForm.duration),
        capacity: Number(editClassForm.capacity),
        classType: editClassForm.classType.trim() || "General",
      });
      toast.success("Class schedule updated");
      setEditClassDialogOpen(false);
      setEditingScheduleId(null);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update class");
    }
  };

  const handlePromoteWaitlist = async (classScheduleId: string) => {
    try {
      await classesService.promoteWaitlist(classScheduleId);
      toast.success("Waitlist promotion triggered");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to promote waitlist");
    }
  };

  const handleCreatePackage = async () => {
    if (!packageForm.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    try {
      await classesService.createClassPackage({
        name: packageForm.name.trim(),
        description: packageForm.description.trim() || undefined,
        passType: packageForm.passType,
        classId: packageForm.classId || undefined,
        creditsIncluded: Number(packageForm.creditsIncluded),
        price: Number(packageForm.price),
        validityDays: Number(packageForm.validityDays) || undefined,
        monthlyUnlimited: packageForm.monthlyUnlimited,
      });
      toast.success("Class package created");
      setPackageDialogOpen(false);
      setPackageForm({
        name: "",
        description: "",
        passType: "BUNDLE",
        classId: "",
        creditsIncluded: 10,
        price: 0,
        validityDays: 30,
        monthlyUnlimited: false,
      });
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create package");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Booking & Waitlist Admin Control</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setClassDialogOpen(true)}>Create Class Schedule</Button>
          <Button variant="outline" onClick={() => setPackageDialogOpen(true)}>
            Create Class Package
          </Button>
          <Button variant="outline" onClick={loadData}>Refresh</Button>
          <div className="ml-auto min-w-[260px]">
            <Label className="mb-1 block text-xs text-muted-foreground">Filter by class schedule</Label>
            <select
              value={selectedScheduleId}
              onChange={(event) => setSelectedScheduleId(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All class schedules</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {formatDate(item.schedule)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Confirmed Bookings</p><p className="text-2xl font-semibold">{bookingStats.confirmed}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Cancelled Bookings</p><p className="text-2xl font-semibold">{bookingStats.cancelled}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Waiting List</p><p className="text-2xl font-semibold">{waitlistStats.waiting}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Active Packages</p><p className="text-2xl font-semibold">{packages.filter((item) => item.isActive).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Schedules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && classes.length === 0 && <p className="text-sm text-muted-foreground">No class schedules found.</p>}
          {classes.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.classType} • {item.trainerName || "Trainer"} • {formatDate(item.schedule)}
                  </p>
                  <p className="text-xs text-muted-foreground">Capacity: {item.capacity} • Slots left: {item.availableSlots ?? 0}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => openEditClass(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePromoteWaitlist(item.id)}>
                    Promote Waitlist
                  </Button>
                  {item.isActive ? (
                    <Button size="sm" variant="destructive" onClick={() => handleDeactivateClass(item.id)}>
                      Deactivate
                    </Button>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings.</p>}
            {bookings.slice(0, 20).map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <p className="font-medium">{item.classSchedule?.class?.name || "Class"}</p>
                <p className="text-xs text-muted-foreground">
                  {item.member?.user?.firstName} {item.member?.user?.lastName} • {item.member?.user?.email}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="outline">{item.status}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(item.bookedAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waitlist Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {waitlist.length === 0 && <p className="text-sm text-muted-foreground">No waitlist entries.</p>}
            {waitlist.slice(0, 20).map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <p className="font-medium">{item.classSchedule?.class?.name || "Class"}</p>
                <p className="text-xs text-muted-foreground">
                  #{item.position} • {item.member?.user?.firstName} {item.member?.user?.lastName}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="outline">{item.status}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Packages</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.description || item.passType}</p>
              <p className="text-sm">Credits: {item.monthlyUnlimited ? "Unlimited" : item.creditsIncluded}</p>
              <p className="text-sm">Price: {item.price}</p>
              <Badge className="mt-2" variant={item.isActive ? "secondary" : "outline"}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Class Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Class name" value={classForm.name} onChange={(event) => setClassForm((prev) => ({ ...prev, name: event.target.value }))} />
            <Input placeholder="Description" value={classForm.description} onChange={(event) => setClassForm((prev) => ({ ...prev, description: event.target.value }))} />
            <Input placeholder="Class type" value={classForm.classType} onChange={(event) => setClassForm((prev) => ({ ...prev, classType: event.target.value }))} />
            <Input type="datetime-local" value={classForm.schedule} onChange={(event) => setClassForm((prev) => ({ ...prev, schedule: event.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Duration (min)" value={classForm.duration} onChange={(event) => setClassForm((prev) => ({ ...prev, duration: Number(event.target.value) }))} />
              <Input type="number" placeholder="Capacity" value={classForm.capacity} onChange={(event) => setClassForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))} />
            </div>
            <select
              value={classForm.trainerId}
              onChange={(event) => setClassForm((prev) => ({ ...prev, trainerId: event.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select trainer</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.firstName} {trainer.lastName}
                </option>
              ))}
            </select>
            <Button onClick={handleCreateClass} className="w-full">Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editClassDialogOpen} onOpenChange={setEditClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Class name"
              value={editClassForm.name}
              onChange={(event) => setEditClassForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              placeholder="Description"
              value={editClassForm.description}
              onChange={(event) => setEditClassForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <Input
              placeholder="Class type"
              value={editClassForm.classType}
              onChange={(event) => setEditClassForm((prev) => ({ ...prev, classType: event.target.value }))}
            />
            <Input
              type="datetime-local"
              value={editClassForm.schedule}
              onChange={(event) => setEditClassForm((prev) => ({ ...prev, schedule: event.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Duration (min)"
                value={editClassForm.duration}
                onChange={(event) => setEditClassForm((prev) => ({ ...prev, duration: Number(event.target.value) }))}
              />
              <Input
                type="number"
                placeholder="Capacity"
                value={editClassForm.capacity}
                onChange={(event) => setEditClassForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))}
              />
            </div>
            <select
              value={editClassForm.trainerId}
              onChange={(event) => setEditClassForm((prev) => ({ ...prev, trainerId: event.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select trainer</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.firstName} {trainer.lastName}
                </option>
              ))}
            </select>
            <Button onClick={handleUpdateClass} className="w-full">Update</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Class Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Package name" value={packageForm.name} onChange={(event) => setPackageForm((prev) => ({ ...prev, name: event.target.value }))} />
            <Input placeholder="Description" value={packageForm.description} onChange={(event) => setPackageForm((prev) => ({ ...prev, description: event.target.value }))} />
            <select
              value={packageForm.passType}
              onChange={(event) => setPackageForm((prev) => ({ ...prev, passType: event.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="BUNDLE">BUNDLE</option>
              <option value="MONTHLY">MONTHLY</option>
            </select>
            <select
              value={packageForm.classId}
              onChange={(event) => setPackageForm((prev) => ({ ...prev, classId: event.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All classes</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Credits" value={packageForm.creditsIncluded} onChange={(event) => setPackageForm((prev) => ({ ...prev, creditsIncluded: Number(event.target.value) }))} />
              <Input type="number" placeholder="Price" value={packageForm.price} onChange={(event) => setPackageForm((prev) => ({ ...prev, price: Number(event.target.value) }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Validity days" value={packageForm.validityDays} onChange={(event) => setPackageForm((prev) => ({ ...prev, validityDays: Number(event.target.value) }))} />
              <label className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={packageForm.monthlyUnlimited}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, monthlyUnlimited: event.target.checked }))}
                />
                Monthly unlimited
              </label>
            </div>
            <Button onClick={handleCreatePackage} className="w-full">Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassesManagement;
