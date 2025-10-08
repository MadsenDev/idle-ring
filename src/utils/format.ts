const UNITS = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"] as const;

const getPrecision = (value: number) => {
  if (value >= 100) return 0;
  if (value >= 10) return 1;
  return 2;
};

export const format = (value: number) => {
  if (!Number.isFinite(value)) return "0";

  const sign = value < 0 ? "-" : "";
  let n = Math.abs(value);

  if (n < 1_000) {
    return `${sign}${n.toFixed(getPrecision(n))}`;
  }

  let unitIndex = -1;
  while (n >= 1_000) {
    n /= 1_000;
    if (unitIndex < UNITS.length - 1) {
      unitIndex++;
    }
  }

  const decimals = getPrecision(n);
  const unit = unitIndex >= 0 ? UNITS[unitIndex] : "";
  return `${sign}${n.toFixed(decimals)}${unit}`;
};
