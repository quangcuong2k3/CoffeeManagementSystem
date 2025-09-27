import bcrypt from 'bcryptjs';
import { AdminUser, LoginCredentials } from '../../../entities/admin/types';
import { adminRepository } from '../../../entities/admin/repository';

/**
 * Admin Service - Business Logic Layer
 * Handles authentication and admin management
 */
export class AdminService {
  private readonly ADMIN_EMAIL = 'admin@tdmu.lqc.com';
  private readonly ADMIN_PASSWORD = 'admin.lqc';

  /**
   * Initialize default admin if not exists
   */
  async initializeDefaultAdmin(): Promise<void> {
    try {
      const existingAdmin = await adminRepository.getAdminByEmail(this.ADMIN_EMAIL);
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(this.ADMIN_PASSWORD, 12);
        
        const adminId = await adminRepository.createAdmin({
          email: this.ADMIN_EMAIL,
          name: 'System Administrator',
          role: 'super_admin',
          permissions: [
            { resource: 'products', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'orders', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'admin', actions: ['create', 'read', 'update', 'delete'] }
          ],
          hashedPassword,
          isActive: true
        });
        
        console.log('Default admin created successfully with ID:', adminId);
      } else {
        console.log('Default admin already exists');
      }
    } catch (error) {
      console.error('Error initializing default admin:', error);
      throw new Error('Failed to initialize admin system');
    }
  }

  /**
   * Authenticate admin user
   */
  async authenticateAdmin(credentials: LoginCredentials): Promise<AdminUser> {
    try {
      // Validate input
      this.validateCredentials(credentials);

      // Check if email is the allowed admin email
      if (credentials.email !== this.ADMIN_EMAIL) {
        throw new Error('Access denied. Admin account not found.');
      }

      // Get admin from database
      const admin = await adminRepository.getAdminByEmail(credentials.email);
      
      if (!admin) {
        throw new Error('Admin account not found');
      }

      if (!admin.isActive) {
        throw new Error('Admin account is disabled');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, admin.hashedPassword);
      
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Update last login
      await adminRepository.updateLastLogin(admin.id);

      // Return admin without password
      const { hashedPassword, ...adminWithoutPassword } = admin;
      return {
        ...adminWithoutPassword,
        lastLogin: new Date()
      } as AdminUser;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Get admin by ID (for session validation)
   */
  async getAdminById(id: string): Promise<AdminUser | null> {
    try {
      const admin = await adminRepository.getAdminById(id);
      
      if (!admin) return null;

      // Return admin without password
      const { hashedPassword, ...adminWithoutPassword } = admin;
      return adminWithoutPassword as AdminUser;
    } catch (error) {
      console.error('Error getting admin by ID:', error);
      return null;
    }
  }

  /**
   * Change admin password
   */
  async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const admin = await adminRepository.getAdminById(adminId);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.hashedPassword);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      this.validatePassword(newPassword);

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await adminRepository.updateAdmin(adminId, {
        hashedPassword: hashedNewPassword
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Update admin profile
   */
  async updateProfile(adminId: string, profileData: { name?: string }): Promise<AdminUser> {
    try {
      if (!profileData.name || profileData.name.trim() === '') {
        throw new Error('Name is required');
      }

      await adminRepository.updateAdmin(adminId, {
        name: profileData.name.trim()
      });

      const updatedAdmin = await adminRepository.getAdminById(adminId);
      
      if (!updatedAdmin) {
        throw new Error('Failed to get updated admin');
      }

      const { hashedPassword, ...adminWithoutPassword } = updatedAdmin;
      return adminWithoutPassword as AdminUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Check if admin system is initialized
   */
  async isAdminSystemInitialized(): Promise<boolean> {
    try {
      const admin = await adminRepository.getAdminByEmail(this.ADMIN_EMAIL);
      return admin !== null;
    } catch (error) {
      console.error('Error checking admin system:', error);
      return false;
    }
  }

  // Private helper methods

  private validateCredentials(credentials: LoginCredentials): void {
    if (!credentials.email || credentials.email.trim() === '') {
      throw new Error('Email is required');
    }

    if (!credentials.password || credentials.password.trim() === '') {
      throw new Error('Password is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Invalid email format');
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();