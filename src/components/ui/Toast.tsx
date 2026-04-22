type ToastVariant = "success" | "error" | "info";

const toneClasses: Record<ToastVariant, string> = {
  success: "border-status-success/20 bg-status-success/10 text-status-success",
  error: "border-status-error/20 bg-status-error/10 text-status-error",
  info: "border-status-info/20 bg-status-info/10 text-status-info"
};

type ToastProps = {
  title: string;
  message: string;
  variant?: ToastVariant;
};

export function Toast({ message, title, variant = "info" }: ToastProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-card ${toneClasses[variant]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

