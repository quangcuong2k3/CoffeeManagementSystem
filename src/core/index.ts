/**
 * Core Layer Index
 * 
 * Exports framework-agnostic utilities and types
 */

// Utilities
export * from './lib/utils';

// Types
export * from './types/common';
export * as EntityTypes from './types'; // Import existing types from the old structure

// Hooks (truly shared, generic hooks)
// export * from './hooks';