/**
 * WorkoutDetailPage Component
 * View workout plan details with exercises
 */

import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useWorkout, useDeleteWorkout } from "../../hooks/useWorkouts.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/common/Button.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function WorkoutDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data: workout, isLoading, error } = useWorkout(id);
  const deleteWorkout = useDeleteWorkout();
  const [toast, setToast] = useState(null);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteWorkout.mutateAsync(id);
        setToast({
          type: "success",
          message: "Workout plan deleted successfully",
        });

        // Navigate to workouts list after a short delay
        setTimeout(() => {
          navigate("/workouts");
        }, 1500);
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to delete workout plan. Please try again.",
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
          <p className="font-medium">Error loading workout plan</p>
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
  if (!workout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">Workout plan not found</p>
          <p className="text-sm">
            The workout plan you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  // Check if user can edit/delete (not a member)
  const canModify = user?.role !== "member";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          to="/workouts"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Workout Plans
        </Link>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{workout.name}</h1>
          <p className="text-gray-600 mt-1">Workout Plan Details</p>
        </div>
        {canModify && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => navigate(`/workouts/${id}/edit`)}
            >
              Edit Plan
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteWorkout.isPending}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Basic Information Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Plan Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Plan Name</p>
            <p className="text-base text-gray-900 mt-1">{workout.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Trainer</p>
            <p className="text-base text-gray-900 mt-1">
              {workout.trainer
                ? `${workout.trainer.firstName} ${workout.trainer.lastName}`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Assigned Member</p>
            <p className="text-base text-gray-900 mt-1">
              {workout.member
                ? `${workout.member.firstName} ${workout.member.lastName}`
                : "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="text-base text-gray-900 mt-1">
              {new Date(workout.startDate).toLocaleDateString()} -{" "}
              {new Date(workout.endDate).toLocaleDateString()}
            </p>
          </div>
          {workout.description && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-base text-gray-900 mt-1">
                {workout.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Exercises Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Exercises ({workout.exercises?.length || 0})
        </h2>
        {workout.exercises && workout.exercises.length > 0 ? (
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {index + 1}. {exercise.name}
                  </h3>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {exercise.sets} sets
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      {exercise.reps} reps
                    </span>
                    {exercise.duration > 0 && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                        {exercise.duration}s
                      </span>
                    )}
                  </div>
                </div>

                {exercise.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {exercise.description}
                  </p>
                )}

                {exercise.notes && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-xs font-medium text-yellow-800 mb-1">
                      Notes:
                    </p>
                    <p className="text-sm text-yellow-900">{exercise.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No exercises added to this workout plan yet.
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
