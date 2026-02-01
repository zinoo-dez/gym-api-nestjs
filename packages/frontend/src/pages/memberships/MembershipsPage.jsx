/**
 * MembershipsPage Component
 * Manage membership plans with CRUD operations
 */

import { useState } from "react";
import {
  useMemberships,
  useCreateMembership,
  useUpdateMembership,
  useDeleteMembership,
  useAssignMembership,
} from "../../hooks/useMemberships.js";
import { useMembers } from "../../hooks/useMembers.js";
import { Table, Pagination } from "../../components/common/Table.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { MembershipForm } from "../../components/forms/MembershipForm.jsx";
import { assignMembershipSchema } from "../../schemas/membership.js";

export function MembershipsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Fetch membership plans
  const { data, isLoading, error } = useMemberships({ page, limit });

  // Mutations
  const createMembership = useCreateMembership();
  const updateMembership = useUpdateMembership();
  const deleteMembership = useDeleteMembership();
  const assignMembership = useAssignMembership();

  // Fetch members for assignment dropdown
  const { data: membersData } = useMembers({ limit: 1000 });

  // Create handler
  const handleCreate = async (formData) => {
    try {
      await createMembership.mutateAsync(formData);
      setToast({
        type: "success",
        message: "Membership plan created successfully",
      });
      setIsCreateModalOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to create membership plan. Please try again.",
      });
    }
  };

  // Edit handler
  const handleEdit = async (formData) => {
    try {
      await updateMembership.mutateAsync({
        id: selectedPlan.id,
        data: formData,
      });
      setToast({
        type: "success",
        message: "Membership plan updated successfully",
      });
      setIsEditModalOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to update membership plan. Please try again.",
      });
    }
  };

  // Delete handler
  const handleDelete = async (id, planName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the "${planName}" membership plan? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteMembership.mutateAsync(id);
        setToast({
          type: "success",
          message: "Membership plan deleted successfully",
        });
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to delete membership plan. Please try again.",
        });
      }
    }
  };

  // Open edit modal
  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  // Open assign modal
  const openAssignModal = (plan) => {
    setSelectedPlan(plan);
    setIsAssignModalOpen(true);
  };

  // Assign membership handler
  const handleAssign = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const memberId = formData.get("memberId");
    const startDate = formData.get("startDate");

    // Validate
    const result = assignMembershipSchema.safeParse({
      memberId,
      membershipPlanId: selectedPlan.id,
      startDate,
    });

    if (!result.success) {
      setToast({
        type: "error",
        message: result.error.errors[0].message,
      });
      return;
    }

    try {
      await assignMembership.mutateAsync({
        memberId,
        data: {
          membershipPlanId: selectedPlan.id,
          startDate,
        },
      });
      setToast({
        type: "success",
        message: "Membership plan assigned successfully",
      });
      setIsAssignModalOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to assign membership plan. Please try again.",
      });
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: "name",
      label: "Plan Name",
      render: (name) => <span className="font-semibold">{name}</span>,
    },
    {
      key: "description",
      label: "Description",
      render: (description) => (
        <span className="text-gray-600">
          {description || "No description"}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (price) => (
        <span className="font-medium">${Number(price).toFixed(2)}</span>
      ),
    },
    {
      key: "durationDays",
      label: "Duration",
      render: (days) => {
        if (days >= 365) {
          return `${Math.floor(days / 365)} year${days >= 730 ? "s" : ""}`;
        } else if (days >= 30) {
          return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""}`;
        }
        return `${days} day${days !== 1 ? "s" : ""}`;
      },
    },
    {
      key: "features",
      label: "Features",
      render: (features) => (
        <div className="text-sm">
          {features && features.length > 0 ? (
            <span className="text-gray-600">
              {features.length} feature{features.length !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-gray-400">No features</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, plan) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => openAssignModal(plan)}
            className="text-xs px-2 py-1"
          >
            Assign
          </Button>
          <Button
            variant="primary"
            onClick={() => openEditModal(plan)}
            className="text-xs px-2 py-1"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(plan.id, plan.name)}
            isLoading={deleteMembership.isPending}
            className="text-xs px-2 py-1"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create New Plan
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error loading membership plans</p>
          <p className="text-sm">
            {error.response?.data?.message ||
              error.message ||
              "An unexpected error occurred"}
          </p>
        </div>
      )}

      {/* Membership Plans Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          emptyMessage="No membership plans found. Create your first plan to get started."
        />

        {/* Pagination */}
        {data && data.meta && (
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            pageSize={data.meta.limit}
            totalItems={data.meta.total}
            onPageChange={setPage}
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Membership Plan"
        size="lg"
      >
        <MembershipForm
          onSubmit={handleCreate}
          isLoading={createMembership.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPlan(null);
        }}
        title="Edit Membership Plan"
        size="lg"
      >
        {selectedPlan && (
          <MembershipForm
            initialData={selectedPlan}
            onSubmit={handleEdit}
            isLoading={updateMembership.isPending}
          />
        )}
      </Modal>

      {/* Assign Membership Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedPlan(null);
        }}
        title={`Assign ${selectedPlan?.name || "Membership Plan"}`}
        size="md"
      >
        {selectedPlan && (
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label
                htmlFor="memberId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Member
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="memberId"
                name="memberId"
                required
                disabled={assignMembership.isPending}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Choose a member...</option>
                {membersData?.data?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                disabled={assignMembership.isPending}
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Plan:</strong> {selectedPlan.name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Price:</strong> ${Number(selectedPlan.price).toFixed(2)}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Duration:</strong> {selectedPlan.durationDays} days
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedPlan(null);
                }}
                disabled={assignMembership.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={assignMembership.isPending}
              >
                Assign Membership
              </Button>
            </div>
          </form>
        )}
      </Modal>

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
