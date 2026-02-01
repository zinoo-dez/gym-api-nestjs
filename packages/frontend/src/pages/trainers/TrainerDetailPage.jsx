import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useTrainer,
  useDeleteTrainer,
  useTrainerClasses,
} from "../../hooks/useTrainers.js";
import { Button } from "../../components/common/Button.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function TrainerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: trainer, isLoading, error } = useTrainer(id);
  const { data: classes, isLoading: classesLoading } = useTrainerClasses(id);
  const deleteTrainer = useDeleteTrainer();
  const [toast, setToast] = useState(null);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${trainer.firstName} ${trainer.lastName}? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteTrainer.mutateAsync(id);
        setToast({
          type: "success",
          message: "Trainer deleted successfully",
        });

        // Navigate to trainers list after a short delay
        setTimeout(() => {
          navigate("/trainers");
        }, 1500);
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to delete trainer. Please try again.",
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
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {trainer.firstName} {trainer.lastName}
          </h1>
          <p className="text-gray-600 mt-1">Trainer Details</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => navigate(`/trainers/${id}/edit`)}
          >
            Edit Trainer
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteTrainer.isPending}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Trainer Information Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">First Name</p>
            <p className="text-base text-gray-900 mt-1">{trainer.firstName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Last Name</p>
            <p className="text-base text-gray-900 mt-1">{trainer.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-base text-gray-900 mt-1">{trainer.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-base text-gray-900 mt-1">{trainer.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Specialization</p>
            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">
              {trainer.specialization}
            </span>
          </div>
        </div>

        {/* Bio Section */}
        {trainer.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-2">Bio</p>
            <p className="text-base text-gray-900 leading-relaxed">
              {trainer.bio}
            </p>
          </div>
        )}
      </div>

      {/* Assigned Classes Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Assigned Classes
        </h2>
        {classesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : classes && classes.length > 0 ? (
          <div className="space-y-3">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {classItem.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {classItem.description || "No description"}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>
                        {classItem.startTime
                          ? new Date(classItem.startTime).toLocaleString()
                          : "Time not available"}
                      </span>
                      <span>
                        Capacity: {classItem.enrolled || 0}/{classItem.capacity}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      classItem.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : classItem.status === "ongoing"
                          ? "bg-green-100 text-green-800"
                          : classItem.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {classItem.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No classes assigned to this trainer
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
