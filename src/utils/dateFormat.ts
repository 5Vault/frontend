/**
 * Formats a date string to a more readable format
 * Input: "2025-10-18 01:56:12" or "2025-10-18T01:56:12"
 * Output: "18/10/2025 01:56"
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString.replace(' ', 'T'));
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formats a date string to show only the date
 * Input: "2025-10-18 01:56:12"
 * Output: "18/10/2025"
 */
export const formatDateOnly = (dateString: string): string => {
  try {
    const date = new Date(dateString.replace(' ', 'T'));
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};
