import React from 'react';
import { cn } from '@/lib/utils';

interface MaterialIconProps {
  icon: string;
  className?: string;
  fill?: boolean;
  weight?: number;
  grade?: number;
  opticalSize?: number;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  icon,
  className,
  fill = false,
  weight = 400,
  grade = 0,
  opticalSize = 24,
}) => {
  return (
    <span
      className={cn(
        "material-symbols-rounded select-none",
        fill && "filled",
        className
      )}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
        fontSize: opticalSize,
      }}
    >
      {icon}
    </span>
  );
};
