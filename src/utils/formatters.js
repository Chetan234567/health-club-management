/*
 * File Path: src/utils/formatters.js
 * Description: Helper utility functions for formatting dates, currency, and calculating subscription days.
 * Viva Tip: Keeps common formatting logic in one place so components stay clean and easy to read.
 */

// Helper: Formats amount numbers to Indian Rupee string (e.g. 1499 -> ₹1,499)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Helper: Calculates remaining subscription days from today's date
export const calculateRemainingDays = (futureDateStr) => {
  if (!futureDateStr) return 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  const diffTime = new Date(futureDateStr) - new Date(todayStr);
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// Helper: Formats status string for badge styling
export const getStatusBadgeStyle = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'SUCCESS':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'PENDING':
    case 'CREATED':
    case 'RENEWAL DUE':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'EXPIRED':
    case 'FAILED':
    default:
      return 'bg-rose-100 text-rose-800 border-rose-200';
  }
};
