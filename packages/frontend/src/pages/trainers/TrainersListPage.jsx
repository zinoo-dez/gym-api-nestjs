import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrainers, useDeleteTrainer } from "../../hooks/useTrainers.js";
import { Table, Pagination } from "../../components/common/Table.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";

export function TrainersListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [toast, setToast] = useState(null);

  // Fetch trainers with filters
  const { data, isLoading, error } = useTrainers({
    page,
    limit,
    search: search || undefined,
    specialization: specializationFilter || undefined,
  });

  // Delete trainer mutation
  const deleteTrainer = useDeleteTrainer();

  const handleDelete = async (id, trainerName) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${trainerName}? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteTrainer.mutateAsync(id);
        setToast({
          type: "success",
          message: "Trainer deleted successfully",
        });
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleSpecializationFilter = (e) => {
    setSpecializationFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  // Table columns configuration
  const columns = [
    {
      key: "firstName",
      label: "First Name",
    },
    {
      key: "lastName",
      label: "Last Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (specialization) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {specialization}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, trainer) => (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/trainers/${trainer.id}`)}
            className="text-xs px-2 py-1 w-full sm:w-auto"
          >
            View
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/trainers/${trainer.id}/edit`)}
            className="text-xs px-2 py-1 w-full sm:w-auto"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              handleDelete(
                trainer.id,
                `${trainer.firstName} ${trainer.lastName}`,
              )
            }
            isLoading={deleteTrainer.isPending}
            className="text-xs px-2 py-1 w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trainers</h1>
        <Button onClick={() => navigate("/trainers/new")} className="w-full sm:w-auto">
          Add New Trainer
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Search"
            name="search"
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or email..."
          />

          <Input
            label="Specialization"
            name="specialization"
            type="text"
            value={specializationFilter}
            onChange={handleSpecializationFilter}
            placeholder="Filter by specialization..."
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
          <p className="font-medium text-sm sm:text-base">Error loading trainers</p>
          <p className="text-xs sm:text-sm">
            {error.response?.data?.message ||
              error.message ||
              "An unexpected error occurred"}
          </p>
        </div>
      )}

      {/* Trainers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          emptyMessage="No trainers found. Try adjusting your filters or add a new trainer."
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
