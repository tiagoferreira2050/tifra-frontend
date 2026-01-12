import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default:
    "bg-black text-white hover:bg-black/90",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-100",
  destructive:
    "bg-red-100 text-red-700 hover:bg-red-100",
  outline:
    "border border-gray-200 text-gray-700",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
