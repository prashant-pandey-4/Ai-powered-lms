import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = 'INR') {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '0 min';
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  if (hours > 0) {
    const remMins = mins % 60;
    return `${hours}h ${remMins > 0 ? `${remMins}m` : ''}`.trim();
  }
  return `${mins} min`;
}
