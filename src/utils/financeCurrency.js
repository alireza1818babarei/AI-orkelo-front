const TOMAN_SUFFIX = ' (T)';

export const formatTomanAmount = (value, fallback = '0') => {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);

  return `${formattedAmount}${TOMAN_SUFFIX}`;
};
