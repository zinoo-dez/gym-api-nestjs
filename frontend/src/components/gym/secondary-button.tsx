import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SecondaryButtonProps extends Omit<ButtonProps, "size" | "variant"> {
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "outline" | "ghost";
}

const sizeMap = {
  sm: "sm",
  md: "default",
  lg: "lg",
} as const;

export function SecondaryButton({
  children,
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  variant = "outline",
  disabled,
  ...props
}: SecondaryButtonProps) {
  return (
    <Button
      variant={variant === "ghost" ? "ghost" : "outline"}
      size={sizeMap[size]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </Button>
  );
}
