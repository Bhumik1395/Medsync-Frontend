import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-blue text-white shadow-card transition-colors duration-200 hover:bg-brand-blue-secondary",
  secondary:
    "border border-brand-blue bg-transparent text-brand-blue transition-colors duration-200 hover:bg-slate-50"
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

