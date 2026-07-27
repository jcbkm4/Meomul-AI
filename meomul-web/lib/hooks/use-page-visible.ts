import { useEffect, useState } from "react";

export function usePageVisible(): boolean {
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);

  useEffect(() => {
    const updateVisibility = (): void => {
      if (typeof document === "undefined") {
        setIsPageVisible(true);
        return;
      }

      setIsPageVisible(document.visibilityState === "visible");
    };

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return isPageVisible;
}
