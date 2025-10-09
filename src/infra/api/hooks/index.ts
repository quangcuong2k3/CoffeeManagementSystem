//import { useOrders } from './orderHook';

/**
 * API Hooks - React hooks for consuming services
 * 
 * This module provides custom React hooks that integrate with our services
 * and provide state management for UI components
 */
export { useAuth, useLoginForm } from './authHooks';
export { useProducts } from './productHooks';
export { useInventory } from './inventoryHooks';
export { useOrders, useOrderStats } from './OrderHook';
export { useGlobalSearch } from './searchHooks';
export { useNotifications } from './notificationsHooks';