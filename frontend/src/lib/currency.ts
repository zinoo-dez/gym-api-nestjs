const USD_CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) {
    return USD_CURRENCY_FORMATTER.format(0);
  }

  return USD_CURRENCY_FORMATTER.format(value);
};
