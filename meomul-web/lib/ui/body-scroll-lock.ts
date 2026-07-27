let activeLockCount = 0;
let previousBodyOverflow = "";

export const lockBodyScroll = (): (() => void) => {
  if (typeof document === "undefined") {
    return () => {};
  }

  if (activeLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  activeLockCount += 1;
  let released = false;

  return () => {
    if (released || typeof document === "undefined") {
      return;
    }

    released = true;
    activeLockCount = Math.max(0, activeLockCount - 1);

    if (activeLockCount === 0) {
      document.body.style.overflow = previousBodyOverflow;
    }
  };
};
