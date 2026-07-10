export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyTotals(totalsByCurrency: Record<string, number>): string {
  const entries = Object.entries(totalsByCurrency).filter(([, total]) => total > 0);

  if (entries.length === 0) {
    return '—';
  }

  if (entries.length === 1) {
    const [currency, total] = entries[0];
    return formatCurrency(total, currency);
  }

  return entries.map(([currency, total]) => formatCurrency(total, currency)).join(' · ');
}
