import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
  children: ReactNode;
  /** Passed through for E2E / diagnostics */
  "data-testid"?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-teal text-white hover:bg-teal-dark shadow-[0_8px_24px_rgba(26,138,138,0.28)]",
  secondary: "bg-navy text-white hover:bg-navy-deep",
  ghost: "bg-transparent text-navy hover:bg-cream",
  outline: "bg-transparent text-navy border border-border hover:border-teal hover:text-teal",
};

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props} type={type}>
      {children}
    </button>
  );
}
