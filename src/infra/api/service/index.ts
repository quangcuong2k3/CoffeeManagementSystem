/**
 * API Services - Business Logic Implementation
 * 
 * This module contains all entity services that implement business logic
 * and use cases for the application
 */

export { AdminService } from './adminService';
export { ProductService } from './productService';  
export { InventoryService } from './inventoryService';

// Create service instances for easy consumption
import { AdminService } from './adminService';
import { ProductService } from './productService';
import { InventoryService } from './inventoryService';

export const adminService = new AdminService();
export const productService = new ProductService();
export const inventoryService = new InventoryService();