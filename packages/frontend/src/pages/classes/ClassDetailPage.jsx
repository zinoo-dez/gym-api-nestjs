import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useClass,
  useDeleteClass,
  useClassBookings,
  useBookClass,
  useCancelBooking,
} from "../../hooks/useClasses.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Button } from "../../components/common/Button.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function ClassDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data: classData, isLoading, error } = useClass(id);
  const { data: bookings, isLoading: bookingsLoading } = useClassBookings(id);
  const deleteClass = useDeleteClass();
  const bookClass = useBookClass();
  const cancelBooking = useCancelBooking();
  const [toast, setToast] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to cancel ${classData.name}? This action will cancel the class.`,
      )
    ) {
      try {
        await deleteClass.mutateAsync(id);
        setToast({
          type: "success",
          message: "Class cancelled successfully",
        });

        // Navigate to class schedule after a short delay
        setTimeout(() => {
          navigate("/classes");
        }, 1500);
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to cancel class. Please try again.",
        });
      }
    }
  };

  const handleBookClass = async () => {
    if (!user) {
      setToast({
        type: "error",
        message: "You must be logged in to book a class",
      });
      return;
    }

    setActionInProgress(true);
    try {
      await bookClass.mutateAsync({
        classId: id,
        data: { memberId: user.id },
      });
      setToast({
        type: "success",
        message: `Successfully booked ${classData.name}`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to book class. Please try again.",
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (
      window.confirm(
        `Are you sure you want to cancel your booking for ${classData.name}?`,
      )
    ) {
      setActionInProgress(true);
      try {
        await cancelBooking.mutateAsync({ classId: id, bookingId });
        setToast({
          type: "success",
          message: `Successfully cancelled booking for ${classData.name}`,
        });
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to cancel booking. Please try again.",
        });
      } finally {
        setActionInProgress(false);
      }
    }
  };

  // Check if class is full
  const isClassFull = () => {
    if (!classData) return false;
    return (classData.enrolled || 0) >= classData.capacity;
  };

  // Check if user has booked this class
  const hasUserBooked = () => {
    if (!user || !bookings) return false;
    return bookings.some((booking) => booking.memberId === user.id);
  };

  // Get user's booking ID
  const getUserBookingId = () => {
    if (!user || !bookings) return null;
    const booking = bookings.find((booking) => booking.memberId === user.id);
    return booking?.id || null;
  };

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading class</p>
          <p className="text-sm">
            {error.response?.data?.message ||
              error.message ||
              "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!classData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">Class not found</p>
          <p className="text-sm">
            The class you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  const isStaffOrAdmin = user?.role === "admin" || user?.role === "staff";
  const isMember = user?.role === "member";
  const userBooked = hasUserBooked();
  const bookingId = getUserBookingId();
  const isFull = isClassFull();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {classData.name}
          </h1>
          <p className="text-gray-600 mt-1">Class Details</p>
        </div>
        <div className="flex gap-3">
          {isStaffOrAdmin && (
            <>
              <Button
                variant="primary"
                onClick={() => navigate(`/classes/${id}/edit`)}
              >
                Edit Class
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleteClass.isPending}
              >
                Cancel Class
              </Button>
            </>
          )}
          {isMember && (
            <>
              {userBooked ? (
                <Button
                  variant="danger"
                  onClick={() => handleCancelBooking(bookingId)}
                  isLoading={actionInProgress}
                  disabled={actionInProgress}
                >
                  Cancel Booking
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleBookClass}
                  isLoading={actionInProgress}
                  disabled={isFull || actionInProgress}
                >
                  {isFull ? "Class Full" : "Book Class"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Class Information Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Class Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Class Name</p>
            <p className="text-base text-gray-900 mt-1">{classData.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Trainer</p>
            <p className="text-base text-gray-900 mt-1">
              {classData.trainer
                ? `${classData.trainer.firstName} ${classData.trainer.lastName}`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Start Time</p>
            <p className="text-base text-gray-900 mt-1">
              {formatDateTime(classData.startTime)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">End Time</p>
            <p className="text-base text-gray-900 mt-1">
              {formatDateTime(classData.endTime)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Capacity</p>
            <p
              className={`text-base font-medium mt-1 ${
                isFull ? "text-red-600" : "text-green-600"
              }`}
            >
              {classData.enrolled || 0} / {classData.capacity}
              {isFull && (
                <span className="ml-2 text-sm text-red-600">(Full)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1 ${
                classData.status === "scheduled"
                  ? "bg-blue-100 text-blue-800"
                  : classData.status === "ongoing"
                    ? "bg-green-100 text-green-800"
                    : classData.status === "completed"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-red-100 text-red-800"
              }`}
            >
              {classData.status}
            </span>
          </div>
        </div>

        {classData.description && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-base text-gray-900 mt-1">
              {classData.description}
            </p>
          </div>
        )}
      </div>

      {/* Bookings Section */}
      {isStaffOrAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Enrolled Members ({bookings?.length || 0})
          </h2>
          {bookingsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.member
                        ? `${booking.member.firstName} ${booking.member.lastName}`
                        : "Unknown Member"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.member?.email || "No email"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Booked:{" "}
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.status || "Confirmed"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No members enrolled yet
            </p>
          )}
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <SimpleToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
