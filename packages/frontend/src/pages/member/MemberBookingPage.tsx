'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { MemberLayout } from '@/components/layouts/member-layout';
import { PrimaryButton, SecondaryButton } from '@/components/gym';
import { ConfirmationDialog } from '@/components/gym/confirmation-dialog';
import { Calendar, Clock, MapPin, User, Trash2, Plus } from 'lucide-react';

interface Booking {
  id: string;
  type: 'class' | 'trainer';
  title: string;
  trainer?: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function MemberBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      type: 'class',
      title: 'HIIT Training',
      date: '2025-02-10',
      time: '18:00',
      duration: 60,
      status: 'upcoming',
    },
    {
      id: '2',
      type: 'trainer',
      title: 'Personal Training Session',
      trainer: 'John Smith',
      date: '2025-02-12',
      time: '10:00',
      duration: 60,
      status: 'upcoming',
    },
    {
      id: '3',
      type: 'class',
      title: 'Yoga Class',
      date: '2025-02-05',
      time: '17:30',
      duration: 45,
      status: 'completed',
    },
  ]);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: 'cancelled' } : booking
      )
    );
    setCancellingId(null);
  };

  const upcomingBookings = bookings.filter((b) => b.status === 'upcoming');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{booking.title}</h3>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {new Date(booking.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {booking.time} ({booking.duration} min)
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
          <button
            onClick={() => setCancellingId(booking.id)}
            className="text-destructive hover:text-destructive/80 transition-colors"
            title="Cancel booking"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredRole="member">
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

          {upcomingBookings.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Bookings</h3>
              <p className="text-muted-foreground mb-4">Schedule a class or training session to get started</p>
              <PrimaryButton>Browse Classes</PrimaryButton>
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

        {/* Cancel Confirmation */}
        <ConfirmationDialog
          isOpen={!!cancellingId}
          title="Cancel Booking"
          description="Are you sure you want to cancel this booking? This action cannot be undone."
          confirmText="Cancel Booking"
          type="danger"
          onConfirm={() => cancellingId && handleCancelBooking(cancellingId)}
          onCancel={() => setCancellingId(null)}
        />
      </MemberLayout>
    </ProtectedRoute>
  );
}
