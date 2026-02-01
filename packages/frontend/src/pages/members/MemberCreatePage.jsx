import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateMember } from "../../hooks/useMembers.js";
import { MemberForm } from "../../components/forms/MemberForm.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";

export function MemberCreatePage() {
  const navigate = useNavigate();
  const createMember = useCreateMember();
  const [toast, setToast] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await createMember.mutateAsync(data);
      setToast({
        type: "success",
        message: "Member created successfully!",
      });

      // Navigate to members list after a short delay
      setTimeout(() => {
        navigate("/members");
      }, 1500);
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create member. Please try again.";

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Member</h1>
        <p className="text-gray-600 mt-2">
          Add a new member to the gym management system
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <MemberForm
          onSubmit={handleSubmit}
          isLoading={createMember.isPending}
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
