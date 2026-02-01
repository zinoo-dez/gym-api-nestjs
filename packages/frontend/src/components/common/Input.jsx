import { memo } from "react";

export const Input = memo(function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  variant = "default", // Added variant prop
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}) {
  const inputId = `input-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1 ${
            variant === "dark" ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : ariaDescribedBy}
        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base transition-all ${
          variant === "dark" 
            ? "bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:bg-white/10" 
            : "bg-white border-gray-300 text-gray-900"
        } ${
          error
            ? "border-red-500 focus:ring-red-500"
            : variant === "dark" ? "focus:border-blue-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
