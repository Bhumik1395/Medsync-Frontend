type TabsProps = {
  items: string[];
  activeItem: string;
  onChange?: (item: string) => void;
};

export function Tabs({ activeItem, items, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-2xl border border-app-border bg-white p-1 shadow-card">
      {items.map((item) => {
        const isActive = item === activeItem;

        return (
          <button
            key={item}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              isActive ? "bg-brand-blue text-white" : "text-app-text-secondary"
            }`}
            onClick={() => onChange?.(item)}
            type="button"
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
