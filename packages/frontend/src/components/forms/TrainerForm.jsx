import { useState, useEffect, memo } from "react";
import { trainerSchema } from "../../schemas/trainer.js";
import { Input } from "../common/Input.jsx";
import { Button } from "../common/Button.jsx";

export const TrainerForm = memo(function TrainerForm({ initialData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState(
    initialData || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialization: "",
      bio: "",
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
    const result = trainerSchema.safeParse(formData);

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
        />

        {/* Email */}
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="trainer@example.com"
          required
          disabled={isLoading}
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
        />

        {/* Specialization */}
        <Input
          label="Specialization"
          name="specialization"
          type="text"
          value={formData.specialization}
          onChange={handleChange}
          error={errors.specialization}
          placeholder="e.g., Yoga, CrossFit, Personal Training"
          required
          disabled={isLoading}
        />
      </div>

      {/* Bio - Full Width */}
      <div className="mb-4">
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Enter trainer bio (optional)"
          disabled={isLoading}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.bio
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.bio}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Maximum 500 characters. Describe the trainer's experience and
          expertise.
        </p>
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
          {initialData ? "Update Trainer" : "Create Trainer"}
        </Button>
      </div>
    </form>
  );
});
