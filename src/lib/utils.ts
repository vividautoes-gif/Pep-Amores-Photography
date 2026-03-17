import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: any): string {
  if (!dateInput) return '';
  try {
    const date = typeof dateInput.toDate === 'function' ? dateInput.toDate() : new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}, ${year}`;
  } catch (e) {
    return '';
  }
}
