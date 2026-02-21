import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { classesService, type ClassSchedule, type ClassFavorite, type ClassPackage, type MemberCredits } from "@/services/classes.service";
import { membersService } from "@/services/members.service";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const MemberClasses = () => {
  const [memberId, setMemberId] = useState<string>("");
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<ClassFavorite[]>([]);
  const [packages, setPackages] = useState<ClassPackage[]>([]);
  const [credits, setCredits] = useState<MemberCredits | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingTargetScheduleId, setRatingTargetScheduleId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [ratingReview, setRatingReview] = useState("");
  const navigate = useNavigate();

  const filteredClasses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((item) =>
      `${item.name} ${item.classType} ${item.trainerName ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [classes, query]);

  const loadAll = async (id: string) => {
    const [classRes, bookingRes, waitlistRes, favoriteRes, packageRes, creditsRes] = await Promise.all([
      classesService.getAll({ page: 1, limit: 30 }),
      classesService.getMemberBookings(id),
      classesService.getMemberWaitlist(id),
      classesService.getMemberFavorites(id),
      classesService.getClassPackages(),
      classesService.getMemberCredits(id),
    ]);

    setClasses(Array.isArray(classRes?.data) ? classRes.data : []);
    setBookings(Array.isArray(bookingRes) ? bookingRes : []);
    setWaitlist(Array.isArray(waitlistRes) ? waitlistRes : []);
    setFavorites(Array.isArray(favoriteRes) ? favoriteRes : []);
    setPackages(Array.isArray(packageRes) ? packageRes : []);
    setCredits(creditsRes ?? null);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const me = await membersService.getMe();
        setMemberId(me.id);
        await loadAll(me.id);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load class features");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleBook = async (scheduleId: string) => {
    if (!memberId) return;
    try {
      await classesService.bookClass(scheduleId, memberId);
      toast.success("Class booked");
      await loadAll(memberId);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Booking failed";
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  const handleJoinWaitlist = async (scheduleId: string) => {
    if (!memberId) return;
    try {
      await classesService.joinWaitlist(scheduleId, memberId);
      toast.success("Added to waitlist");
      await loadAll(memberId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to join waitlist");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await classesService.cancelBooking(bookingId);
      toast.success("Booking cancelled");
      await loadAll(memberId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleFavorite = async (classId: string) => {
    if (!memberId) return;
    try {
      await classesService.favoriteClass(classId, memberId);
      toast.success("Added to favorites");
      await loadAll(memberId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to favorite class");
    }
  };

  const handleUnfavorite = async (classId: string) => {
    if (!memberId) return;
    try {
      await classesService.unfavoriteClass(classId, memberId);
      toast.success("Removed from favorites");
      await loadAll(memberId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove favorite");
    }
  };

  const handleBuyPackage = async (classPackageId: string) => {
    if (!memberId) return;
    try {
      await classesService.purchaseClassPackage(classPackageId, memberId);
      toast.success("Package purchased");
      await loadAll(memberId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to purchase package");
    }
  };

  const openRateModal = (classScheduleId: string) => {
    setRatingTargetScheduleId(classScheduleId);
    setRatingValue(5);
    setRatingReview("");
    setRatingModalOpen(true);
  };

  const handleRateInstructor = async () => {
    if (!memberId || !ratingTargetScheduleId) return;
    try {
      await classesService.rateInstructor(
        ratingTargetScheduleId,
        memberId,
        ratingValue,
        ratingReview.trim() || undefined,
      );
      toast.success("Instructor rated");
      setRatingModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to rate instructor");
    }
  };

  const handleViewInstructorProfile = (trainerId: string) => {
    navigate(`/member/instructors/${trainerId}`);
  };

  const favoriteClassIds = new Set(favorites.map((item) => item.classId));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Booking & Waitlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search classes by name, type, trainer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {credits && (
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">Credits: {credits.totalRemainingCredits}</Badge>
              <Badge variant={credits.hasUnlimitedPass ? "default" : "outline"}>
                {credits.hasUnlimitedPass ? "Unlimited Pass Active" : "No Unlimited Pass"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && filteredClasses.length === 0 && (
            <p className="text-sm text-muted-foreground">No classes found.</p>
          )}
          {filteredClasses.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.classType} • {item.trainerName || "Trainer"} • {formatDate(item.schedule)}
                  </p>
                  <p className="text-xs text-muted-foreground">Slots left: {item.availableSlots ?? 0}</p>
                </div>
                <div className="flex gap-2">
                  {item.trainerId && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewInstructorProfile(item.trainerId)}
                    >
                      Instructor
                    </Button>
                  )}
                  <Button size="sm" onClick={() => handleBook(item.id)}>Book</Button>
                  <Button size="sm" variant="outline" onClick={() => handleJoinWaitlist(item.id)}>Waitlist</Button>
                  {favoriteClassIds.has(item.id) ? (
                    <Button size="sm" variant="ghost" onClick={() => handleUnfavorite(item.id)}>Unfavorite</Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleFavorite(item.id)}>Favorite</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border p-3">
                <p className="font-medium">{booking.classSchedule?.class?.name || "Class"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(booking.classSchedule?.startTime)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="outline">{booking.status}</Badge>
                  <div className="flex gap-2">
                    {booking.classSchedule?.trainerId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewInstructorProfile(booking.classSchedule.trainerId)}
                      >
                        Instructor
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openRateModal(booking.classScheduleId)}
                    >
                      Rate
                    </Button>
                    {booking.status !== "CANCELLED" && (
                      <Button size="sm" variant="destructive" onClick={() => handleCancelBooking(booking.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Waitlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {waitlist.length === 0 && <p className="text-sm text-muted-foreground">No waitlist entries.</p>}
            {waitlist.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3">
                <p className="font-medium">{entry.classSchedule?.class?.name || "Class"}</p>
                <p className="text-xs text-muted-foreground">Position: {entry.position}</p>
                <Badge variant="outline">{entry.status}</Badge>
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
          {packages.map((pack) => (
            <div key={pack.id} className="rounded-lg border p-3">
              <p className="font-semibold">{pack.name}</p>
              <p className="text-sm text-muted-foreground">{pack.description || pack.passType}</p>
              <p className="text-sm">Credits: {pack.monthlyUnlimited ? "Unlimited" : pack.creditsIncluded}</p>
              <p className="text-sm">Price: {pack.price}</p>
              <Button className="mt-3 w-full" size="sm" onClick={() => handleBuyPackage(pack.id)}>
                Buy Package
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rate Instructor</DialogTitle>
            <DialogDescription>
              Share your class experience to help other members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={ratingValue === value ? "default" : "outline"}
                    onClick={() => setRatingValue(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Review (optional)</p>
              <Textarea
                value={ratingReview}
                onChange={(event) => setRatingReview(event.target.value)}
                placeholder="What did you like about this class?"
              />
            </div>
            <Button onClick={handleRateInstructor} className="w-full">
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberClasses;
