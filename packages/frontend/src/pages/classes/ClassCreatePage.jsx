import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateClass } from "../../hooks/useClasses.js";
import { useTrainers } from "../../hooks/useTrainers.js";
import { ClassForm } from "../../components/forms/ClassForm.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function ClassCreatePage() {
  const navigate = useNavigate();
  const createClass = useCreateClass();
  const { data: trainersData, isLoading: trainersLoading } = useTrainers();
  const [toast, setToast] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await createClass.mutateAsync(data);
      setToast({
        type: "success",
        message: "Class created successfully!",
      });

      // Navigate to class schedule after a short delay
      setTimeout(() => {
        navigate("/classes");
      }, 1500);
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create class. Please try again.";

      setToast({
        type: "error",
        message: errorMessage,
      });
    }
  };

  if (trainersLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Class</h1>
        <p className="text-gray-600 mt-2">
          Schedule a new class for gym members
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <ClassForm
          onSubmit={handleSubmit}
          isLoading={createClass.isPending}
          trainers={trainersData?.data || []}
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
