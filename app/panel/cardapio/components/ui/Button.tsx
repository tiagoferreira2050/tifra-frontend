"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  className,
  variant = "default",
  size = "md",
  ...rest
}: ButtonProps) {
  const base = "rounded-md font-medium transition focus:outline-none";

  const variants: Record<string, string> = {
    default: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-700 text-white hover:bg-red-800",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      {...rest}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}
