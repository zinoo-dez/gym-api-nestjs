import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTrainer } from "../../hooks/useTrainers.js";
import { TrainerForm } from "../../components/forms/TrainerForm.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";

export function TrainerCreatePage() {
  const navigate = useNavigate();
  const createTrainer = useCreateTrainer();
  const [toast, setToast] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await createTrainer.mutateAsync(data);
      setToast({
        type: "success",
        message: "Trainer created successfully!",
      });

      // Navigate to trainers list after a short delay
      setTimeout(() => {
        navigate("/trainers");
      }, 1500);
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create trainer. Please try again.";

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Trainer</h1>
        <p className="text-gray-600 mt-2">
          Add a new trainer to the gym management system
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <TrainerForm
          onSubmit={handleSubmit}
          isLoading={createTrainer.isPending}
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
