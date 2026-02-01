import { useState, useEffect, memo } from "react";
import { classSchema } from "../../schemas/class.js";
import { Input } from "../common/Input.jsx";
import { Button } from "../common/Button.jsx";

export const ClassForm = memo(function ClassForm({ initialData, onSubmit, isLoading, trainers = [] }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      description: "",
      trainerId: "",
      startTime: "",
      endTime: "",
      capacity: 20,
      status: "scheduled",
    },
  );
  const [errors, setErrors] = useState({});

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      // Format datetime for input fields
      const formatted = { ...initialData };
      if (formatted.startTime) {
        formatted.startTime = new Date(formatted.startTime)
          .toISOString()
          .slice(0, 16);
      }
      if (formatted.endTime) {
        formatted.endTime = new Date(formatted.endTime)
          .toISOString()
          .slice(0, 16);
      }
      setFormData(formatted);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseInt(value, 10) : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert datetime-local strings to ISO format
    const submitData = {
      ...formData,
      startTime: formData.startTime
        ? new Date(formData.startTime).toISOString()
        : "",
      endTime: formData.endTime ? new Date(formData.endTime).toISOString() : "",
    };

    // Validate with Zod schema
    const result = classSchema.safeParse(submitData);

    if (!result.success) {
      // Convert Zod errors to field errors
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const fieldName = err.path[0];
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Call onSubmit with validated data
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Name */}
        <Input
          label="Class Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter class name"
          required
          disabled={isLoading}
        />

        {/* Trainer */}
        <div className="mb-4">
          <label
            htmlFor="trainerId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Trainer
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="trainerId"
            name="trainerId"
            value={formData.trainerId}
            onChange={handleChange}
            disabled={isLoading}
            required
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.trainerId
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="">Select a trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.firstName} {trainer.lastName}
                {trainer.specialization && ` - ${trainer.specialization}`}
              </option>
            ))}
          </select>
          {errors.trainerId && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.trainerId}
            </p>
          )}
        </div>

        {/* Start Time */}
        <Input
          label="Start Time"
          name="startTime"
          type="datetime-local"
          value={formData.startTime}
          onChange={handleChange}
          error={errors.startTime}
          required
          disabled={isLoading}
        />

        {/* End Time */}
        <Input
          label="End Time"
          name="endTime"
          type="datetime-local"
          value={formData.endTime}
          onChange={handleChange}
          error={errors.endTime}
          required
          disabled={isLoading}
        />

        {/* Capacity */}
        <Input
          label="Capacity"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          error={errors.capacity}
          placeholder="Enter maximum capacity"
          min="1"
          max="100"
          required
          disabled={isLoading}
        />

        {/* Status */}
        <div className="mb-4">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.status
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.status}
            </p>
          )}
        </div>
      </div>

      {/* Description - Full Width */}
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter class description (optional)"
          disabled={isLoading}
          rows="4"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.description
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? "Update Class" : "Create Class"}
        </Button>
      </div>
    </form>
  );
});
