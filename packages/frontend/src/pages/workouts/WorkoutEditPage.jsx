/**
 * WorkoutEditPage Component
 * Edit existing workout plan
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkout, useUpdateWorkout } from "../../hooks/useWorkouts.js";
import { WorkoutForm } from "../../components/forms/WorkoutForm.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function WorkoutEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: workout, isLoading, error } = useWorkout(id);
  const updateWorkout = useUpdateWorkout();
  const [toast, setToast] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await updateWorkout.mutateAsync({ id, data });
      setToast({
        type: "success",
        message: "Workout plan updated successfully!",
      });

      // Navigate to workout detail page after a short delay
      setTimeout(() => {
        navigate(`/workouts/${id}`);
      }, 1500);
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update workout plan. Please try again.";

      setToast({
        type: "error",
        message: errorMessage,
      });
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Workout Plan
        </h1>
        <p className="text-gray-600 mt-2">
          Update the workout plan details and exercises
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <WorkoutForm
          initialData={workout}
          onSubmit={handleSubmit}
          isLoading={updateWorkout.isPending}
        />
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
