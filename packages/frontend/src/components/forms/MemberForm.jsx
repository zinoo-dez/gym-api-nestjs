import { useState, useEffect, memo } from "react";
import { memberSchema } from "../../schemas/member.js";
import { Input } from "../common/Input.jsx";
import { Button } from "../common/Button.jsx";

export const MemberForm = memo(function MemberForm({ initialData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState(
    initialData || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      membershipPlanId: "",
      status: "active",
    },
  );
  const [errors, setErrors] = useState({});

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

    // Validate with Zod schema
    const result = memberSchema.safeParse(formData);

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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate aria-label="Member form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* First Name */}
        <Input
          label="First Name"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="Enter first name"
          required
          disabled={isLoading}
          autoComplete="given-name"
        />

        {/* Last Name */}
        <Input
          label="Last Name"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Enter last name"
          required
          disabled={isLoading}
          autoComplete="family-name"
        />

        {/* Email */}
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="member@example.com"
          required
          disabled={isLoading}
          autoComplete="email"
        />

        {/* Phone */}
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+1234567890"
          required
          disabled={isLoading}
          autoComplete="tel"
        />

        {/* Date of Birth */}
        <Input
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          required
          disabled={isLoading}
          autoComplete="bday"
        />

        {/* Membership Plan ID */}
        <div className="mb-4">
          <label
            htmlFor="membershipPlanId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Membership Plan
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          </label>
          <input
            id="membershipPlanId"
            name="membershipPlanId"
            type="text"
            value={formData.membershipPlanId}
            onChange={handleChange}
            placeholder="Enter membership plan ID"
            disabled={isLoading}
            required
            aria-invalid={errors.membershipPlanId ? "true" : "false"}
            aria-describedby={errors.membershipPlanId ? "membershipPlanId-error membershipPlanId-help" : "membershipPlanId-help"}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] sm:min-h-0 ${
              errors.membershipPlanId
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.membershipPlanId && (
            <p id="membershipPlanId-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.membershipPlanId}
            </p>
          )}
          <p id="membershipPlanId-help" className="mt-1 text-xs text-gray-500">
            Note: In a future update, this will be a dropdown with available
            membership plans
          </p>
        </div>

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
            aria-invalid={errors.status ? "true" : "false"}
            aria-describedby={errors.status ? "status-error" : undefined}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] sm:min-h-0 ${
              errors.status
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          {errors.status && (
            <p id="status-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.status}
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isLoading}
          className="w-full sm:w-auto"
          aria-label="Cancel and go back"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isLoading} 
          className="w-full sm:w-auto"
          aria-label={initialData ? "Update member information" : "Create new member"}
        >
          {initialData ? "Update Member" : "Create Member"}
        </Button>
      </div>
    </form>
  );
});
