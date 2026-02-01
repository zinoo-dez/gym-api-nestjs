import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useMember,
  useDeleteMember,
  useMemberBookings,
  useMemberWorkoutPlans,
} from "../../hooks/useMembers.js";
import { Button } from "../../components/common/Button.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function MemberDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: member, isLoading, error } = useMember(id);
  const { data: bookings, isLoading: bookingsLoading } = useMemberBookings(id);
  const { data: workoutPlans, isLoading: workoutPlansLoading } =
    useMemberWorkoutPlans(id);
  const deleteMember = useDeleteMember();
  const [toast, setToast] = useState(null);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to deactivate ${member.firstName} ${member.lastName}? This action will set their status to inactive.`,
      )
    ) {
      try {
        await deleteMember.mutateAsync(id);
        setToast({
          type: "success",
          message: "Member deactivated successfully",
        });

        // Navigate to members list after a short delay
        setTimeout(() => {
          navigate("/members");
        }, 1500);
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to deactivate member. Please try again.",
        });
      }
    }
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
          <p className="font-medium">Error loading member</p>
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
  if (!member) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">Member not found</p>
          <p className="text-sm">
            The member you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Member Details</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={() => navigate(`/members/${id}/edit`)}
            className="w-full sm:w-auto"
          >
            Edit Member
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMember.isPending}
            className="w-full sm:w-auto"
          >
            Deactivate
          </Button>
        </div>
      </div>

      {/* Member Information Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">First Name</p>
            <p className="text-base text-gray-900 mt-1">{member.firstName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Last Name</p>
            <p className="text-base text-gray-900 mt-1">{member.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-base text-gray-900 mt-1 break-all">{member.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-base text-gray-900 mt-1">{member.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
            <p className="text-base text-gray-900 mt-1">
              {new Date(member.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1 ${
                member.status === "active"
                  ? "bg-green-100 text-green-800"
                  : member.status === "inactive"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {member.status}
            </span>
          </div>
        </div>
      </div>

      {/* Membership Information Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Membership Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Membership Plan ID
            </p>
            <p className="text-base text-gray-900 mt-1">
              {member.membershipPlanId}
            </p>
          </div>
          {member.membershipPlan && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">Plan Name</p>
                <p className="text-base text-gray-900 mt-1">
                  {member.membershipPlan.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Plan Price</p>
                <p className="text-base text-gray-900 mt-1">
                  ${member.membershipPlan.price}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-base text-gray-900 mt-1">
                  {member.membershipPlan.durationDays} days
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Class Bookings Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Class Bookings
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
                className="border border-gray-200 rounded-lg p-4"
              >
                <p className="font-medium text-gray-900">
                  {booking.class?.name || "Unknown Class"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.class?.startTime
                    ? new Date(booking.class.startTime).toLocaleString()
                    : "Time not available"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Status: {booking.status || "Confirmed"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No class bookings found
          </p>
        )}
      </div>

      {/* Workout Plans Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Workout Plans
        </h2>
        {workoutPlansLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : workoutPlans && workoutPlans.length > 0 ? (
          <div className="space-y-3">
            {workoutPlans.map((plan) => (
              <div
                key={plan.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <p className="font-medium text-gray-900">{plan.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {plan.description || "No description"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Trainer: {plan.trainer?.firstName} {plan.trainer?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Duration: {new Date(plan.startDate).toLocaleDateString()} -{" "}
                  {new Date(plan.endDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No workout plans assigned
          </p>
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
