import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ error, id, label, className = "", ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-app-text" htmlFor={id}>
      <span>{label}</span>
      <input
        className={`rounded-xl border border-app-border bg-white px-4 py-3 text-sm text-app-text outline-none transition-colors duration-200 focus:border-brand-blue ${className}`}
        id={id}
        {...props}
      />
      {error ? <span className="text-sm text-status-error">{error}</span> : null}
    </label>
  );
}

