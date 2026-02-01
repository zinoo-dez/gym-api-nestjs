import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMember, useUpdateMember } from "../../hooks/useMembers.js";
import { MemberForm } from "../../components/forms/MemberForm.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export function MemberEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: member, isLoading, error } = useMember(id);
  const updateMember = useUpdateMember();
  const [toast, setToast] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await updateMember.mutateAsync({ id, data });
      setToast({
        type: "success",
        message: "Member updated successfully!",
      });

      // Navigate to member detail page after a short delay
      setTimeout(() => {
        navigate(`/members/${id}`);
      }, 1500);
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update member. Please try again.";

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>
        <p className="text-gray-600 mt-2">
          Update information for {member.firstName} {member.lastName}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <MemberForm
          initialData={member}
          onSubmit={handleSubmit}
          isLoading={updateMember.isPending}
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
