import type { ReactNode, TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export function Textarea({ error, hint, id, label, className = "", ...props }: TextareaProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-app-text" htmlFor={id}>
      <span>{label}</span>
      <textarea
        className={`min-h-28 rounded-xl border border-app-border bg-white px-4 py-3 text-sm text-app-text outline-none transition-colors duration-200 focus:border-brand-blue ${className}`}
        id={id}
        {...props}
      />
      {hint ? <span className="text-sm text-app-text-secondary">{hint}</span> : null}
      {error ? <span className="text-sm text-status-error">{error}</span> : null}
    </label>
  );
}

