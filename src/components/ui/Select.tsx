import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  children: ReactNode;
};

export function Select({ children, error, id, label, className = "", ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-app-text" htmlFor={id}>
      <span>{label}</span>
      <select
        className={`rounded-xl border border-app-border bg-white px-4 py-3 text-sm text-app-text outline-none transition-colors duration-200 focus:border-brand-blue ${className}`}
        id={id}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-sm text-status-error">{error}</span> : null}
    </label>
  );
}

