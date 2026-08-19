"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg";
  block?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

/** The single button in the app — every tappable action goes through here. */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", block, icon, iconRight, className = "", children, type = "button", ...rest },
  ref,
) {
  const classes = [
    "btn",
    VARIANT_CLASS[variant],
    size === "lg" ? "btn-lg" : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
});

export default Button;
