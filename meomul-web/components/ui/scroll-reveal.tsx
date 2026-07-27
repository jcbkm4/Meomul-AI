import { useEffect, useRef, useState, type PropsWithChildren } from "react";

interface ScrollRevealProps extends PropsWithChildren {
  className?: string;
  delayMs?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  threshold = 0.1,
  rootMargin = "0px 0px 12% 0px",
  once = true,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = elementRef.current;
    if (!target) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className ?? ""}`}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
