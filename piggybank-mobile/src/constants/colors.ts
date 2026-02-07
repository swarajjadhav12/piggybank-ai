export const colors = {
    // Primary colors
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',

    // Secondary colors
    secondary: '#10b981',
    secondaryDark: '#059669',
    secondaryLight: '#34d399',

    // Accent colors
    accent: '#f59e0b',
    accentDark: '#d97706',
    accentLight: '#fbbf24',

    // Status colors
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#3b82f6',

    // Neutral colors
    white: '#ffffff',
    black: '#000000',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',

    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundDark: '#111827',
    card: '#ffffff',

    // Text colors
    text: '#111827',
    textSecondary: '#6b7280',
    textLight: '#9ca3af',
    textWhite: '#ffffff',

    // Border colors
    border: '#e5e7eb',
    borderDark: '#d1d5db',

    // Category colors (for expenses)
    categoryFood: '#ef4444',
    categoryTransport: '#3b82f6',
    categoryShopping: '#8b5cf6',
    categoryEntertainment: '#ec4899',
    categoryUtilities: '#f59e0b',
    categoryHealth: '#10b981',
    categoryOther: '#6b7280',
};

export type ColorKey = keyof typeof colors;
