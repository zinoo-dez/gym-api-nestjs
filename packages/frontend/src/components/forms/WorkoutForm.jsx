import { useState, useEffect, memo } from "react";
import { workoutPlanSchema } from "../../schemas/workout.js";
import { Input } from "../common/Input.jsx";
import { Button } from "../common/Button.jsx";

export const WorkoutForm = memo(function WorkoutForm({ initialData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      description: "",
      trainerId: "",
      memberId: "",
      exercises: [
        {
          name: "",
          description: "",
          sets: 3,
          reps: 10,
          duration: 0,
          notes: "",
        },
      ],
      startDate: "",
      endDate: "",
    }
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

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: field === "sets" || field === "reps" || field === "duration" 
        ? Number(value) 
        : value,
    };
    setFormData((prev) => ({ ...prev, exercises: updatedExercises }));

    // Clear exercise-specific errors
    if (errors[`exercises.${index}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`exercises.${index}.${field}`];
        return newErrors;
      });
    }
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          name: "",
          description: "",
          sets: 3,
          reps: 10,
          duration: 0,
          notes: "",
        },
      ],
    }));
  };

  const removeExercise = (index) => {
    if (formData.exercises.length > 1) {
      setFormData((prev) => ({
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate with Zod schema
    const result = workoutPlanSchema.safeParse(formData);

    if (!result.success) {
      // Convert Zod errors to field errors
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Call onSubmit with validated data
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workout Plan Name */}
          <Input
            label="Workout Plan Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter workout plan name"
            required
            disabled={isLoading}
          />

          {/* Trainer ID */}
          <div className="mb-4">
            <label
              htmlFor="trainerId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Trainer ID
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="trainerId"
              name="trainerId"
              type="text"
              value={formData.trainerId}
              onChange={handleChange}
              placeholder="Enter trainer ID"
              disabled={isLoading}
              required
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.trainerId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.trainerId && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.trainerId}
              </p>
            )}
          </div>

          {/* Member ID */}
          <div className="mb-4">
            <label
              htmlFor="memberId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Member ID
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="memberId"
              name="memberId"
              type="text"
              value={formData.memberId}
              onChange={handleChange}
              placeholder="Enter member ID"
              disabled={isLoading}
              required
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.memberId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.memberId && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.memberId}
              </p>
            )}
          </div>

          {/* Start Date */}
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
            required
            disabled={isLoading}
          />

          {/* End Date */}
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            error={errors.endDate}
            required
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div className="mt-4">
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
            placeholder="Enter workout plan description (optional)"
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
      </div>

      {/* Exercises */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={addExercise}
            disabled={isLoading}
            className="text-sm"
          >
            + Add Exercise
          </Button>
        </div>

        {errors.exercises && typeof errors.exercises === "string" && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {errors.exercises}
          </p>
        )}

        <div className="space-y-4">
          {formData.exercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">
                  Exercise {index + 1}
                </h4>
                {formData.exercises.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeExercise(index)}
                    disabled={isLoading}
                    className="text-xs px-2 py-1"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exercise Name */}
                <div className="md:col-span-2">
                  <label
                    htmlFor={`exercise-name-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Exercise Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id={`exercise-name-${index}`}
                    type="text"
                    value={exercise.name}
                    onChange={(e) =>
                      handleExerciseChange(index, "name", e.target.value)
                    }
                    placeholder="e.g., Push-ups, Squats, Bench Press"
                    disabled={isLoading}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors[`exercises.${index}.name`]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`exercises.${index}.name`] && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors[`exercises.${index}.name`]}
                    </p>
                  )}
                </div>

                {/* Sets */}
                <div>
                  <label
                    htmlFor={`exercise-sets-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sets
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id={`exercise-sets-${index}`}
                    type="number"
                    min="1"
                    max="20"
                    value={exercise.sets}
                    onChange={(e) =>
                      handleExerciseChange(index, "sets", e.target.value)
                    }
                    disabled={isLoading}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors[`exercises.${index}.sets`]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`exercises.${index}.sets`] && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors[`exercises.${index}.sets`]}
                    </p>
                  )}
                </div>

                {/* Reps */}
                <div>
                  <label
                    htmlFor={`exercise-reps-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reps
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id={`exercise-reps-${index}`}
                    type="number"
                    min="1"
                    max="100"
                    value={exercise.reps}
                    onChange={(e) =>
                      handleExerciseChange(index, "reps", e.target.value)
                    }
                    disabled={isLoading}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors[`exercises.${index}.reps`]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`exercises.${index}.reps`] && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors[`exercises.${index}.reps`]}
                    </p>
                  )}
                </div>

                {/* Duration (optional) */}
                <div>
                  <label
                    htmlFor={`exercise-duration-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Duration (seconds)
                  </label>
                  <input
                    id={`exercise-duration-${index}`}
                    type="number"
                    min="0"
                    value={exercise.duration || 0}
                    onChange={(e) =>
                      handleExerciseChange(index, "duration", e.target.value)
                    }
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors[`exercises.${index}.duration`]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`exercises.${index}.duration`] && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors[`exercises.${index}.duration`]}
                    </p>
                  )}
                </div>

                {/* Exercise Description */}
                <div className="md:col-span-2">
                  <label
                    htmlFor={`exercise-description-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id={`exercise-description-${index}`}
                    value={exercise.description || ""}
                    onChange={(e) =>
                      handleExerciseChange(index, "description", e.target.value)
                    }
                    placeholder="Exercise description (optional)"
                    disabled={isLoading}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors[`exercises.${index}.description`]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`exercises.${index}.description`] && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors[`exercises.${index}.description`]}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label
                    htmlFor={`exercise-notes-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id={`exercise-notes-${index}`}
                    value={exercise.notes || ""}
                    onChange={(e) =>
                      handleExerciseChange(index, "notes", e.target.value)
                    }
                    placeholder="Additional notes (optional)"
                    disabled={isLoading}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors[`exercises.${index}.notes`]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`exercises.${index}.notes`] && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors[`exercises.${index}.notes`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
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
          {initialData ? "Update Workout Plan" : "Create Workout Plan"}
        </Button>
      </div>
    </form>
  );
});
