import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface PrimaryButtonProps extends Omit<ButtonProps, "size" | "variant"> {
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeMap = {
  sm: "sm",
  md: "default",
  lg: "lg",
} as const;

export function PrimaryButton({
  children,
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <Button variant="default" size={sizeMap[size]} disabled={disabled || isLoading} {...props}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </Button>
  );
}
