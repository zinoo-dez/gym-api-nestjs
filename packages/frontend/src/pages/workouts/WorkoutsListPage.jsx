/**
 * WorkoutsListPage Component
 * List of workout plans with role-based filtering
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkouts, useDeleteWorkout } from "../../hooks/useWorkouts.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Table, Pagination } from "../../components/common/Table.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";

export function WorkoutsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Build query params based on user role
  const queryParams = {
    page,
    limit,
    search: search || undefined,
  };

  // Filter by role: trainers see their own plans, members see their assigned plans
  if (user?.role === "trainer") {
    queryParams.trainerId = user.id;
  } else if (user?.role === "member") {
    queryParams.memberId = user.id;
  }
  // Admin and staff see all workout plans (no filter)

  // Fetch workout plans with filters
  const { data, isLoading, error } = useWorkouts(queryParams);

  // Delete workout plan mutation
  const deleteWorkout = useDeleteWorkout();

  const handleDelete = async (id, workoutName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${workoutName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteWorkout.mutateAsync(id);
        setToast({
          type: "success",
          message: "Workout plan deleted successfully",
        });
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  // Table columns configuration
  const columns = [
    {
      key: "name",
      label: "Workout Plan",
    },
    {
      key: "trainer",
      label: "Trainer",
      render: (trainer) =>
        trainer ? `${trainer.firstName} ${trainer.lastName}` : "N/A",
    },
    {
      key: "member",
      label: "Assigned Member",
      render: (member) =>
        member ? `${member.firstName} ${member.lastName}` : "Unassigned",
    },
    {
      key: "exercises",
      label: "Exercises",
      render: (exercises) => (exercises ? exercises.length : 0),
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      key: "endDate",
      label: "End Date",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, workout) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/workouts/${workout.id}`)}
            className="text-xs px-2 py-1"
          >
            View
          </Button>
          {/* Only trainers, admins, and staff can edit/delete */}
          {user?.role !== "member" && (
            <>
              <Button
                variant="primary"
                onClick={() => navigate(`/workouts/${workout.id}/edit`)}
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(workout.id, workout.name)}
                isLoading={deleteWorkout.isPending}
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workout Plans</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === "trainer" && "Manage your workout plans"}
            {user?.role === "member" && "View your assigned workout plans"}
            {(user?.role === "admin" || user?.role === "staff") &&
              "Manage all workout plans"}
          </p>
        </div>
        {/* Only trainers, admins, and staff can create workout plans */}
        {user?.role !== "member" && (
          <Button onClick={() => navigate("/workouts/new")}>
            Create Workout Plan
          </Button>
        )}
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            name="search"
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by workout plan name..."
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error loading workout plans</p>
          <p className="text-sm">
            {error.response?.data?.message ||
              error.message ||
              "An unexpected error occurred"}
          </p>
        </div>
      )}

      {/* Workout Plans Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          emptyMessage="No workout plans found. Try adjusting your search or create a new workout plan."
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
