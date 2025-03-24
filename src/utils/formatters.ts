/**
 * Format a number to use k/M suffixes for thousands/millions
 * @param num The number to format
 * @returns Formatted string (e.g., "1.5k" for 1500, "1.2M" for 1200000)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Format days into a readable time format (days/months/years)
 * @param days Number of days to format
 * @returns Formatted string (e.g., "5d", "2mo", "1.5yr")
 */
export function formatTime(days: number): string {
  if (days >= 365) {
    return (days / 365).toFixed(1) + 'yr';
  } else if (days >= 30) {
    return Math.floor(days / 30) + 'mo';
  }
  return days + 'd';
} 