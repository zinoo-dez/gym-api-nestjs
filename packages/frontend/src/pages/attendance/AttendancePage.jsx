/**
 * AttendancePage Component
 * Track and view attendance records with filtering and statistics
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { useState } from "react";
import {
  useAttendance,
  useRecordAttendance,
  useAttendanceStatistics,
} from "../../hooks/useAttendance.js";
import { useMembers } from "../../hooks/useMembers.js";
import { Table, Pagination } from "../../components/common/Table.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { SimpleToast } from "../../components/common/SimpleToast.jsx";

export function AttendancePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [memberFilter, setMemberFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch attendance records with filters
  const { data, isLoading, error } = useAttendance({
    page,
    limit,
    memberId: memberFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    type: typeFilter || undefined,
  });

  // Fetch attendance statistics with same filters
  const { data: statistics } = useAttendanceStatistics({
    memberId: memberFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Fetch members for dropdown
  const { data: membersData } = useMembers({ limit: 1000 });

  // Mutations
  const recordAttendance = useRecordAttendance();

  const handleRecordAttendance = async (attendanceData) => {
    try {
      await recordAttendance.mutateAsync(attendanceData);
      setToast({
        type: "success",
        message: "Attendance recorded successfully",
      });
      setIsRecordModalOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to record attendance. Please try again.",
      });
    }
  };

  const handleMemberFilterChange = (e) => {
    setMemberFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPage(1);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(1);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: "member",
      label: "Member Name",
      render: (member) =>
        member ? `${member.firstName} ${member.lastName}` : "Unknown",
    },
    {
      key: "checkInTime",
      label: "Check-In Time",
      render: (checkInTime) => formatDateTime(checkInTime),
    },
    {
      key: "type",
      label: "Type",
      render: (type) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            type === "GYM_VISIT"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {type === "GYM_VISIT" ? "Gym Visit" : "Class Attendance"}
        </span>
      ),
    },
    {
      key: "class",
      label: "Class",
      render: (classData) => (classData ? classData.name : "N/A"),
    },
    {
      key: "checkOutTime",
      label: "Check-Out Time",
      render: (checkOutTime) =>
        checkOutTime ? formatDateTime(checkOutTime) : "Not checked out",
    },
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Tracking</h1>
        <Button onClick={() => setIsRecordModalOpen(true)} className="w-full sm:w-auto">
          Record Attendance
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Total Visits
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {statistics.totalVisits || 0}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Gym Visits
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {statistics.gymVisits || 0}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Class Attendances
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">
              {statistics.classAttendances || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Member Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member
            </label>
            <select
              value={memberFilter}
              onChange={handleMemberFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] sm:min-h-0"
            >
              <option value="">All Members</option>
              {membersData?.data?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />

          {/* End Date Filter */}
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
          />

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] sm:min-h-0"
            >
              <option value="">All Types</option>
              <option value="GYM_VISIT">Gym Visit</option>
              <option value="CLASS_ATTENDANCE">Class Attendance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
          <p className="font-medium text-sm sm:text-base">Error loading attendance records</p>
          <p className="text-xs sm:text-sm">
            {error.response?.data?.message ||
              error.message ||
              "An unexpected error occurred"}
          </p>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          emptyMessage="No attendance records found. Try adjusting your filters or record new attendance."
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

      {/* Record Attendance Modal */}
      {isRecordModalOpen && (
        <RecordAttendanceModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          onSubmit={handleRecordAttendance}
          members={membersData?.data || []}
          isLoading={recordAttendance.isPending}
        />
      )}

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

/**
 * RecordAttendanceModal Component
 * Modal form for recording new attendance
 */
function RecordAttendanceModal({ isOpen, onClose, onSubmit, members, isLoading }) {
  const [formData, setFormData] = useState({
    memberId: "",
    type: "GYM_VISIT",
    classId: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.memberId) {
      newErrors.memberId = "Member is required";
    }
    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for submission
    const submitData = {
      memberId: formData.memberId,
      type: formData.type,
    };

    // Only include classId if type is CLASS_ATTENDANCE and classId is provided
    if (formData.type === "CLASS_ATTENDANCE" && formData.classId) {
      submitData.classId = formData.classId;
    }

    onSubmit(submitData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Attendance">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Member <span className="text-red-500">*</span>
          </label>
          <select
            name="memberId"
            value={formData.memberId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] sm:min-h-0 ${
              errors.memberId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
          {errors.memberId && (
            <p className="mt-1 text-sm text-red-600">{errors.memberId}</p>
          )}
        </div>

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] sm:min-h-0 ${
              errors.type ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="GYM_VISIT">Gym Visit</option>
            <option value="CLASS_ATTENDANCE">Class Attendance</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        {/* Class ID (optional, only for class attendance) */}
        {formData.type === "CLASS_ATTENDANCE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class ID (Optional)
            </label>
            <input
              type="text"
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              placeholder="Enter class ID if applicable"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px] sm:min-h-0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to record general class attendance
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            Record Attendance
          </Button>
        </div>
      </form>
    </Modal>
  );
}
