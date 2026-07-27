export type DetailIconName =
  | "status"
  | "capacity"
  | "bed"
  | "view"
  | "size"
  | "inventory"
  | "surcharge"
  | "eyes"
  | "clock"
  | "wifi"
  | "food"
  | "service"
  | "access"
  | "parking"
  | "entertainment"
  | "default";

interface DetailIconProps {
  name: DetailIconName;
  className?: string;
}

export function DetailIcon({ name, className = "h-4 w-4" }: DetailIconProps) {
  if (name === "status") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <circle cx="12" cy="12" r="8" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  if (name === "capacity") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M4 18c0-2.8 2.2-5 5-5s5 2.2 5 5M14 18c0-1.9 1.5-3.5 3.5-3.5S21 16.1 21 18" />
      </svg>
    );
  }
  if (name === "bed") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M3 11h18v6H3z" />
        <path d="M3 11V8a2 2 0 012-2h4a2 2 0 012 2v3M13 11V9a2 2 0 012-2h4a2 2 0 012 2v2" />
        <path d="M3 17v3M21 17v3" />
      </svg>
    );
  }
  if (name === "view" || name === "eyes") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }
  if (name === "size") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" />
        <path d="M8 8l-5-5M16 8l5-5M8 16l-5 5M16 16l5 5" />
      </svg>
    );
  }
  if (name === "inventory" || name === "parking") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M3 8l2-3h14l2 3v10H3z" />
        <path d="M7 18a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM17 18a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
      </svg>
    );
  }
  if (name === "surcharge" || name === "food" || name === "service") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M9.5 10.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 2-2.5 2-2.5.8-2.5 2 1.1 2 2.5 2 2.5-.8 2.5-2" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    );
  }
  if (name === "wifi") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M4 10a12 12 0 0116 0M7 13a8 8 0 0110 0M10 16a4 4 0 014 0" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "access") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <circle cx="12" cy="6.5" r="1.8" />
        <path d="M8 10h8M12 8.5V16M12 12l4 4M12 12l-3 5" />
      </svg>
    );
  }
  if (name === "entertainment") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M10 17v4M14 17v4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 8l8-5 8 5v10l-8 5-8-5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
