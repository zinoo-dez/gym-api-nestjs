import { memo } from "react";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

/**
 * Button Component - Backward Compatibility Wrapper
 * Maps old Button API to new PrimaryButton/SecondaryButton components
 * 
 * @deprecated Use PrimaryButton or SecondaryButton directly for new code
 */
export const Button = memo(function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
  ...props
}) {
  // Map old variants to new components
  const variantMap = {
    primary: "primary",
    success: "primary",
    premium: "primary",
    secondary: "secondary",
    ghost: "secondary",
    outline: "secondary",
    danger: "primary", // Will need custom styling
  };

  const mappedVariant = variantMap[variant] || "primary";
  const ButtonComponent = mappedVariant === "primary" ? PrimaryButton : SecondaryButton;

  // Add custom classes for special variants
  let customClasses = className;
  if (variant === "danger") {
    customClasses += " !bg-red-600 hover:!bg-red-700 !shadow-red-600/20";
  } else if (variant === "ghost") {
    customClasses += " !bg-transparent !text-gray-400 hover:!text-white hover:!bg-white/5 !border-transparent hover:!border-white/10";
  } else if (variant === "premium") {
    customClasses += " !bg-gradient-to-r !from-primary !via-accent !to-accent-400";
  }

  return (
    <ButtonComponent
      type={type}
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
      className={customClasses}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </ButtonComponent>
  );
});
