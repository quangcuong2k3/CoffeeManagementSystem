/**
 * Application Configuration
 * Environment variables and constants
 */

interface AppConfig {
  // Environment
  NODE_ENV: string;
  isDevelopment: boolean;
  isProduction: boolean;
  
  // API Configuration
  apiUrl: string;
  apiTimeout: number;
  
  // Firebase Configuration
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    databaseURL: string;
  };
  
  // Authentication
  auth: {
    adminEmail: string;
    sessionTimeout: number;
  };
  
  // Application Settings
  app: {
    name: string;
    version: string;
    description: string;
    defaultLanguage: string;
    supportedLanguages: string[];
  };
  
  // Feature Flags
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableDarkMode: boolean;
    enableExperimental: boolean;
  };
  
  // UI Configuration
  ui: {
    defaultPageSize: number;
    maxPageSize: number;
    defaultTimeout: number;
    animationDuration: number;
  };
  
  // Business Rules
  business: {
    maxProductsPerPage: number;
    defaultCurrency: string;
    supportedCurrencies: string[];
    stockAlertThresholds: {
      low: number;
      critical: number;
    };
  };
}

// Validate environment variables
const validateEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Create configuration object
export const config: AppConfig = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
  
  // Firebase Configuration
  firebase: {
    apiKey: validateEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: validateEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: validateEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: validateEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: validateEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: validateEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 
      `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
  },
  
  // Authentication
  auth: {
    adminEmail: process.env.ADMIN_EMAIL || 'admin@coffeehouse.com',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000') // 1 hour
  },
  
  // Application Settings
  app: {
    name: 'Coffee Management System',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Comprehensive coffee house management dashboard',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr']
  },
  
  // Feature Flags
  features: {
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
    enableDarkMode: process.env.ENABLE_DARK_MODE !== 'false',
    enableExperimental: process.env.ENABLE_EXPERIMENTAL === 'true'
  },
  
  // UI Configuration
  ui: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20'),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100'),
    defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '5000'),
    animationDuration: parseInt(process.env.ANIMATION_DURATION || '300')
  },
  
  // Business Rules
  business: {
    maxProductsPerPage: parseInt(process.env.MAX_PRODUCTS_PER_PAGE || '50'),
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
    supportedCurrencies: (process.env.SUPPORTED_CURRENCIES || 'USD,EUR,GBP').split(','),
    stockAlertThresholds: {
      low: parseInt(process.env.STOCK_LOW_THRESHOLD || '10'),
      critical: parseInt(process.env.STOCK_CRITICAL_THRESHOLD || '5')
    }
  }
};

// Application Constants
export const APP_CONSTANTS = {
  // Routes
  ROUTES: {
    DASHBOARD: '/dashboard',
    PRODUCTS: '/products',
    INVENTORY: '/inventory',
    ORDERS: '/orders',
    CUSTOMERS: '/customers',
    ANALYTICS: '/analytics',
    SETTINGS: '/settings',
    LOGIN: '/login'
  } as const,
  
  // Local Storage Keys
  STORAGE_KEYS: {
    THEME: 'coffee_theme',
    LANGUAGE: 'coffee_language',
    SIDEBAR_COLLAPSED: 'coffee_sidebar_collapsed',
    USER_PREFERENCES: 'coffee_user_preferences',
    AUTH_TOKEN: 'coffee_auth_token'
  } as const,
  
  // API Endpoints
  API_ENDPOINTS: {
    PRODUCTS: '/products',
    INVENTORY: '/inventory',
    ORDERS: '/orders',
    CUSTOMERS: '/customers',
    ANALYTICS: '/analytics',
    UPLOAD: '/upload',
    EXPORT: '/export'
  } as const,
  
  // File Types
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 1000,
    MIN_PRICE: 0.01,
    MAX_PRICE: 999999.99
  } as const,
  
  // Date Formats
  DATE_FORMATS: {
    SHORT: 'MMM dd, yyyy',
    LONG: 'MMMM dd, yyyy',
    WITH_TIME: 'MMM dd, yyyy HH:mm',
    TIME_ONLY: 'HH:mm:ss',
    ISO: 'yyyy-MM-dd',
    FULL_ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
  } as const,
  
  // Status Values
  STATUS: {
    PRODUCT: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      DRAFT: 'draft',
      ARCHIVED: 'archived'
    },
    ORDER: {
      PENDING: 'pending',
      PAID: 'paid',
      CONFIRMED: 'confirmed',
      PREPARING: 'preparing',
      READY: 'ready',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
      FAILED: 'failed'
    },
    INVENTORY: {
      IN_STOCK: 'in_stock',
      LOW_STOCK: 'low_stock',
      OUT_OF_STOCK: 'out_of_stock'
    }
  } as const,
  
  // Error Codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    CONFLICT: 'CONFLICT',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR'
  } as const,
  
  // Colors (for charts, status indicators, etc.)
  COLORS: {
    PRIMARY: '#8B4513',
    SECONDARY: '#D2691E',
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
    MUTED: '#6b7280'
  } as const,
  
  // Chart Colors
  CHART_COLORS: [
    '#8B4513', // Coffee Brown
    '#D2691E', // Chocolate
    '#CD853F', // Peru
    '#A0522D', // Sienna
    '#8B7355', // Dark Khaki
    '#DEB887', // Burlywood
    '#F4A460', // Sandy Brown
    '#DAA520'  // Goldenrod
  ] as const
} as const;

export default config;