export const toggleStringCsv = (current: string[], value: string, checked: boolean): string => {
  const next = new Set(current);
  if (checked) {
    next.add(value);
  } else {
    next.delete(value);
  }
  return Array.from(next).join(",");
};

export const toggleNumberCsv = (current: number[], value: number, checked: boolean): string => {
  const next = new Set(current);
  if (checked) {
    next.add(value);
  } else {
    next.delete(value);
  }
  return Array.from(next)
    .sort((a, b) => a - b)
    .join(",");
};
