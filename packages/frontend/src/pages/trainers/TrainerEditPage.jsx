import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrainer, useUpdateTrainer } from "../../hooks/useTrainers.js";
import { TrainerForm } from "../../components/forms/TrainerForm.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function TrainerEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: trainer, isLoading, error } = useTrainer(id);
  const updateTrainer = useUpdateTrainer();
  const [toast, setToast] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await updateTrainer.mutateAsync({ id, data });
      setToast({
        type: "success",
        message: "Trainer updated successfully!",
      });

      // Navigate to trainer detail page after a short delay
      setTimeout(() => {
        navigate(`/trainers/${id}`);
      }, 1500);
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update trainer. Please try again.";

      setToast({
        type: "error",
        message: errorMessage,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading trainer</p>
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
  if (!trainer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">Trainer not found</p>
          <p className="text-sm">
            The trainer you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Trainer</h1>
        <p className="text-gray-600 mt-2">
          Update information for {trainer.firstName} {trainer.lastName}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <TrainerForm
          initialData={trainer}
          onSubmit={handleSubmit}
          isLoading={updateTrainer.isPending}
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
