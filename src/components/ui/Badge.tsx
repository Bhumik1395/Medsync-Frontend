import type { ReactNode } from "react";

type BadgeVariant = "info" | "success";

const badgeClasses: Record<BadgeVariant, string> = {
  info: "bg-status-info/10 text-status-info",
  success: "bg-status-success/10 text-status-success"
};

export function Badge({ children, variant = "info" }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[variant]}`}>
      {children}
    </span>
  );
}

