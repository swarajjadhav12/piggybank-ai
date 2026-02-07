// API Configuration
// For Android Emulator: use 10.0.2.2 instead of localhost
// For physical device: use your computer's local IP (e.g., 192.168.1.X)
export const API_BASE_URL = __DEV__
    ? 'http://10.50.37.33:3001/api'  // Local network IP (works for both emulator and physical devices)
    : 'https://your-production-api.com/api';

// Alternative for physical device testing (uncomment and update IP):
// export const API_BASE_URL = 'http://192.168.1.X:3001/api';

export const APP_NAME = 'PiggyBank AI';
export const APP_VERSION = '1.0.0';
