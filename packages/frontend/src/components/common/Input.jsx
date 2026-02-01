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
  variant = "default",
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}) {
  const inputId = `input-${name}`;
  const errorId = `${inputId}-error`;

  const labelStyles = variant === "dark" 
    ? "text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-2 px-1" 
    : "text-gray-700 font-semibold mb-1";

  const inputBaseStyles = "w-full px-5 py-4 border rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base transition-all duration-300";

  const variantStyles = variant === "dark"
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 focus:bg-white/[0.08] focus:border-blue-500/50 backdrop-blur-sm"
    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500";

  const errorStyles = error
    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10"
    : "";

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className={`block ${labelStyles}`}>
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative">
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
          className={`${inputBaseStyles} ${variantStyles} ${errorStyles}`}
          {...props}
        />
        {/* Subtle inner glow for dark variant */}
        {variant === "dark" && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-xs text-red-400 font-medium px-1 flex items-center gap-1" role="alert">
          <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
          {error}
        </p>
      )}
    </div>
  );
});
