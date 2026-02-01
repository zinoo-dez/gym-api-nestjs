/**
 * WorkoutCreatePage Component
 * Create new workout plan
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateWorkout } from "../../hooks/useWorkouts.js";
import { WorkoutForm } from "../../components/forms/WorkoutForm.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";

export function WorkoutCreatePage() {
  const navigate = useNavigate();
  const createWorkout = useCreateWorkout();
  const [toast, setToast] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await createWorkout.mutateAsync(data);
      setToast({
        type: "success",
        message: "Workout plan created successfully!",
      });

      // Navigate to workouts list after a short delay
      setTimeout(() => {
        navigate("/workouts");
      }, 1500);
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create workout plan. Please try again.";

      setToast({
        type: "error",
        message: errorMessage,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Workout Plan
        </h1>
        <p className="text-gray-600 mt-2">
          Create a new workout plan with exercises for a member
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <WorkoutForm
          onSubmit={handleSubmit}
          isLoading={createWorkout.isPending}
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
