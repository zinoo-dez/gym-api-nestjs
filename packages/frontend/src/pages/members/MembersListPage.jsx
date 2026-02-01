import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMembers, useDeleteMember } from "../../hooks/useMembers.js";
import { Table, Pagination } from "../../components/common/Table.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";
import { AnimatedPage } from "../../components/animated/index.js";

export function MembersListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState(null);

  // Fetch members with filters
  const { data, isLoading, error } = useMembers({
    page,
    limit,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  // Delete member mutation
  const deleteMember = useDeleteMember();

  const handleDelete = async (id, memberName) => {
    if (
      window.confirm(
        `Are you sure you want to deactivate ${memberName}? This action will set their status to inactive.`,
      )
    ) {
      try {
        await deleteMember.mutateAsync(id);
        setToast({
          type: "success",
          message: "Member deactivated successfully",
        });
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to deactivate member. Please try again.",
        });
      }
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
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
      render: (phone) => (
        <span className="hidden sm:inline">{phone}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : status === "inactive"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, member) => (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/members/${member.id}`)}
            className="text-xs px-2 py-1 w-full sm:w-auto"
          >
            View
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/members/${member.id}/edit`)}
            className="text-xs px-2 py-1 w-full sm:w-auto"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              handleDelete(member.id, `${member.firstName} ${member.lastName}`)
            }
            isLoading={deleteMember.isPending}
            className="text-xs px-2 py-1 w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AnimatedPage className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Members</h1>
        <Button onClick={() => navigate("/members/new")} className="w-full sm:w-auto">
          Add New Member
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            name="search"
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or email..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] sm:min-h-0"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error loading members</p>
          <p className="text-sm">
            {error.response?.data?.message ||
              error.message ||
              "An unexpected error occurred"}
          </p>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          emptyMessage="No members found. Try adjusting your filters or add a new member."
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
    </AnimatedPage>
  );
}
