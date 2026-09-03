import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "../icons";
import "./button.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, ...rest }: Props) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner width={size === "sm" ? 13 : 15} height={size === "sm" ? 13 : 15} /> : icon}
      {children && <span>{children}</span>}
    </button>
  );
}
