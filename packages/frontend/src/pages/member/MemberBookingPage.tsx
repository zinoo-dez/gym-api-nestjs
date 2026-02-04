import React, { useEffect, useMemo, useState } from 'react';
import { MemberLayout } from '../../layouts';
import { PrimaryButton } from '@/components/gym';
import { membersService } from '@/services/members.service';
import { Calendar, Clock, User, Plus } from 'lucide-react';

interface BookingView {
  id: string;
  title: string;
  trainer?: string;
  startTime: Date;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function MemberBookingsPage() {
  const [bookings, setBookings] = useState<BookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await membersService.getMyBookings();
        const now = new Date();
        const normalized = Array.isArray(response)
          ? response.map((booking: any) => {
              const start = booking.classSchedule?.startTime
                ? new Date(booking.classSchedule.startTime)
                : new Date();
              return {
                id: booking.id,
                title: booking.class?.name || 'Class',
                trainer: booking.class?.trainer
                  ? `${booking.class.trainer.firstName} ${booking.class.trainer.lastName}`
                  : undefined,
                startTime: start,
                duration: booking.class?.duration || 0,
                status: booking.status === 'CONFIRMED'
                  ? start >= now ? 'upcoming' : 'completed'
                  : booking.status === 'CANCELLED'
                  ? 'cancelled'
                  : 'completed',
              } as BookingView;
            })
          : [];
        setBookings(normalized);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError('Failed to load bookings.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'upcoming'),
    [bookings],
  );
  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'completed'),
    [bookings],
  );
  const cancelledBookings = useMemo(
    () => bookings.filter((b) => b.status === 'cancelled'),
    [bookings],
  );

  const BookingCard = ({ booking }: { booking: BookingView }) => (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{booking.title}</h3>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {booking.startTime.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.duration} min)
            </div>
            {booking.trainer && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <User className="w-4 h-4" />
                {booking.trainer}
              </div>
            )}
          </div>

          <div className="mt-4 inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
        </div>

        {booking.status === 'upcoming' && (
          <div className="text-xs text-muted-foreground">Scheduled</div>
        )}
      </div>
    </div>
  );

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground mt-2">Manage your classes and training sessions</p>
          </div>
          <PrimaryButton className="gap-2">
            <Plus className="w-4 h-4" />
            New Booking
          </PrimaryButton>
        </div>

        {loading && (
          <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
            Loading bookings...
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && upcomingBookings.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Bookings</h3>
            <p className="text-muted-foreground mb-4">Schedule a class to get started</p>
            <PrimaryButton>Browse Classes</PrimaryButton>
          </div>
        )}

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming</h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Bookings */}
        {completedBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Completed</h2>
            <div className="space-y-4">
              {completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Bookings */}
        {cancelledBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Cancelled</h2>
            <div className="space-y-4">
              {cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}
      </div>

    </MemberLayout>
  );
}
