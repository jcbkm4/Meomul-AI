interface StatusPillsProps {
  label?: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  includeAll?: boolean;
}

export function StatusPills({ label = "Status", options, selected, onSelect, includeAll = true }: StatusPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-sm font-medium text-slate-600">{label}:</span>
      {includeAll ? (
        <button
          type="button"
          onClick={() => onSelect("ALL")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            selected === "ALL" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700"
          }`}
        >
          ALL
        </button>
      ) : null}
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            selected === option ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
