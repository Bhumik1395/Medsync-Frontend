import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-app-border bg-white p-6 shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

