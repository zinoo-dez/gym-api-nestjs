import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useClasses,
  useBookClass,
  useCancelBooking,
} from "../../hooks/useClasses.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Table, Pagination } from "../../components/common/Table.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function ClassSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [classTypeFilter, setClassTypeFilter] = useState("");
  const [toast, setToast] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(null);

  // Fetch classes with filters
  const { data, isLoading, error } = useClasses({
    page,
    limit,
    date: dateFilter || undefined,
    trainerId: trainerFilter || undefined,
    classType: classTypeFilter || undefined,
  });

  // Booking mutations
  const bookClass = useBookClass();
  const cancelBooking = useCancelBooking();

  const handleBookClass = async (classId, className) => {
    if (!user) {
      setToast({
        type: "error",
        message: "You must be logged in to book a class",
      });
      return;
    }

    setBookingInProgress(classId);
    try {
      await bookClass.mutateAsync({
        classId,
        data: { memberId: user.id },
      });
      setToast({
        type: "success",
        message: `Successfully booked ${className}`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to book class. Please try again.",
      });
    } finally {
      setBookingInProgress(null);
    }
  };

  const handleCancelBooking = async (classId, bookingId, className) => {
    if (
      window.confirm(
        `Are you sure you want to cancel your booking for ${className}?`,
      )
    ) {
      setBookingInProgress(classId);
      try {
        await cancelBooking.mutateAsync({ classId, bookingId });
        setToast({
          type: "success",
          message: `Successfully cancelled booking for ${className}`,
        });
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to cancel booking. Please try again.",
        });
      } finally {
        setBookingInProgress(null);
      }
    }
  };

  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
    setPage(1);
  };

  const handleTrainerFilter = (e) => {
    setTrainerFilter(e.target.value);
    setPage(1);
  };

  const handleClassTypeFilter = (e) => {
    setClassTypeFilter(e.target.value);
    setPage(1);
  };

  // Check if class is full
  const isClassFull = (classItem) => {
    return classItem.enrolled >= classItem.capacity;
  };

  // Check if user has booked this class
  const hasUserBooked = (classItem) => {
    if (!user || !classItem.bookings) return false;
    return classItem.bookings.some((booking) => booking.memberId === user.id);
  };

  // Get user's booking ID for a class
  const getUserBookingId = (classItem) => {
    if (!user || !classItem.bookings) return null;
    const booking = classItem.bookings.find(
      (booking) => booking.memberId === user.id,
    );
    return booking?.id || null;
  };

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: "name",
      label: "Class Name",
    },
    {
      key: "trainer",
      label: "Trainer",
      render: (trainer) =>
        trainer ? `${trainer.firstName} ${trainer.lastName}` : "N/A",
    },
    {
      key: "startTime",
      label: "Start Time",
      render: (startTime) => formatDateTime(startTime),
    },
    {
      key: "endTime",
      label: "End Time",
      render: (endTime) => formatDateTime(endTime),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (capacity, classItem) => (
        <span
          className={`font-medium ${
            isClassFull(classItem) ? "text-red-600" : "text-green-600"
          }`}
        >
          {classItem.enrolled || 0} / {capacity}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            status === "scheduled"
              ? "bg-blue-100 text-blue-800"
              : status === "ongoing"
                ? "bg-green-100 text-green-800"
                : status === "completed"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, classItem) => {
        const isFull = isClassFull(classItem);
        const userBooked = hasUserBooked(classItem);
        const bookingId = getUserBookingId(classItem);
        const isStaffOrAdmin =
          user?.role === "admin" || user?.role === "staff";
        const inProgress = bookingInProgress === classItem.id;

        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/classes/${classItem.id}`)}
              className="text-xs px-2 py-1 w-full sm:w-auto"
            >
              View
            </Button>

            {isStaffOrAdmin && (
              <>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/classes/${classItem.id}/edit`)}
                  className="text-xs px-2 py-1 w-full sm:w-auto"
                >
                  Edit
                </Button>
              </>
            )}

            {user?.role === "member" && (
              <>
                {userBooked ? (
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleCancelBooking(
                        classItem.id,
                        bookingId,
                        classItem.name,
                      )
                    }
                    isLoading={inProgress}
                    disabled={inProgress}
                    className="text-xs px-2 py-1 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => handleBookClass(classItem.id, classItem.name)}
                    isLoading={inProgress}
                    disabled={isFull || inProgress}
                    className="text-xs px-2 py-1 w-full sm:w-auto"
                  >
                    {isFull ? "Class Full" : "Book"}
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Class Schedule</h1>
        {(user?.role === "admin" || user?.role === "staff") && (
          <Button onClick={() => navigate("/classes/new")} className="w-full sm:w-auto">
            Create New Class
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Input
            label="Date"
            name="date"
            type="date"
            value={dateFilter}
            onChange={handleDateFilter}
            placeholder="Filter by date"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trainer
            </label>
            <select
              value={trainerFilter}
              onChange={handleTrainerFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] sm:min-h-0"
            >
              <option value="">All Trainers</option>
              {/* TODO: Populate with actual trainers from API */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Type
            </label>
            <select
              value={classTypeFilter}
              onChange={handleClassTypeFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] sm:min-h-0"
            >
              <option value="">All Types</option>
              <option value="yoga">Yoga</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength Training</option>
              <option value="hiit">HIIT</option>
              <option value="pilates">Pilates</option>
              <option value="spinning">Spinning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
          <p className="font-medium text-sm sm:text-base">Error loading classes</p>
          <p className="text-xs sm:text-sm">
            {error.response?.data?.message ||
              error.message ||
              "An unexpected error occurred"}
          </p>
        </div>
      )}

      {/* Classes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          emptyMessage="No classes found. Try adjusting your filters or create a new class."
        />

        {/* Pagination */}
        {data && data.meta && (
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            pageSize={data.meta.limit}
            totalItems={data.meta.total}
            onPageChange={setPage}
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </div>

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
