/**
 * Format a number as currency (Indian Rupees)
 */
export const formatCurrency = (amount: number): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '₹0';
    }

    // Convert to absolute value for formatting
    const absAmount = Math.abs(amount);
    const isNegative = amount < 0;

    // Format with commas (Indian numbering system)
    const formatted = absAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${isNegative ? '-' : ''}₹${formatted}`;
};

/**
 * Format a date string
 */
export const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) {
        return 'N/A';
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (dateString: string | undefined | null): string => {
    if (!dateString) {
        return 'N/A';
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return 'Invalid Date';
    }
};

/**
 * Format a number with commas (Indian numbering system)
 */
export const formatNumber = (num: number): string => {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }

    return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (current: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min(Math.round((current / total) * 100), 100);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
