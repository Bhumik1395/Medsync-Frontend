import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Modal({ children, description, title }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-app-border bg-white p-6 shadow-card">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-brand-blue">{title}</h2>
          {description ? <p className="mt-2 text-sm text-app-text-secondary">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

