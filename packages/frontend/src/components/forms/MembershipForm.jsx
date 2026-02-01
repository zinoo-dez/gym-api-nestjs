import { useState, useEffect, useRef, memo } from "react";
import { membershipPlanSchema } from "../../schemas/membership.js";
import { Input } from "../common/Input.jsx";
import { Button } from "../common/Button.jsx";

export const MembershipForm = memo(function MembershipForm({ initialData, onSubmit, isLoading }) {
  // Track if initialData has been processed to avoid unnecessary updates
  const initialDataRef = useRef(initialData);
  
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        // Ensure features is an array with at least one empty string
        features:
          initialData.features && initialData.features.length > 0
            ? initialData.features
            : [""],
      };
    }
    return {
      name: "",
      description: "",
      price: "",
      durationDays: "",
      features: [""],
    };
  });
  const [errors, setErrors] = useState({});

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && initialData !== initialDataRef.current) {
      initialDataRef.current = initialData;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...initialData,
        // Ensure features is an array with at least one empty string
        features:
          initialData.features && initialData.features.length > 0
            ? initialData.features
            : [""],
      });
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

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));

    // Clear features error when user starts typing
    if (errors.features) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.features;
        return newErrors;
      });
    }
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, features: newFeatures }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert string values to numbers for validation
    const dataToValidate = {
      ...formData,
      price: formData.price === "" ? 0 : Number(formData.price),
      durationDays:
        formData.durationDays === "" ? 0 : Number(formData.durationDays),
      // Filter out empty features
      features: formData.features.filter((f) => f.trim() !== ""),
    };

    // Validate with Zod schema
    const result = membershipPlanSchema.safeParse(dataToValidate);

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
      <div className="grid grid-cols-1 gap-6">
        {/* Plan Name */}
        <Input
          label="Plan Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g., Basic, Premium, VIP"
          required
          disabled={isLoading}
        />

        {/* Description */}
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
            placeholder="Describe the membership plan..."
            disabled={isLoading}
            rows={3}
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

        {/* Price and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Price ($)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            placeholder="0.00"
            required
            disabled={isLoading}
          />

          <Input
            label="Duration (Days)"
            name="durationDays"
            type="number"
            min="1"
            value={formData.durationDays}
            onChange={handleChange}
            error={errors.durationDays}
            placeholder="e.g., 30, 90, 365"
            required
            disabled={isLoading}
          />
        </div>

        {/* Features */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                  disabled={isLoading}
                  className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.features
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formData.features.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeFeature(index)}
                    disabled={isLoading}
                    className="px-3"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          {errors.features && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.features}
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={addFeature}
            disabled={isLoading}
            className="mt-2"
          >
            + Add Feature
          </Button>
        </div>
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
          {initialData ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  );
});
