/**
 * Firebase Storage Service for Product Images
 * Handles image upload, deletion, and URL generation for product images
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';

export class FirebaseStorageService {
  private readonly PRODUCTS_PATH = 'products';

  /**
   * Upload product image to Firebase Storage
   */
  async uploadProductImage(
    file: File, 
    productId: string, 
    category: 'coffee' | 'bean',
    type: 'square' | 'portrait'
  ): Promise<string> {
    try {
      // Generate file path: products/coffee/C1/square/image.jpg
      const fileName = `${Date.now()}_${file.name}`;
      const imagePath = `${this.PRODUCTS_PATH}/${category}/${productId}/${type}/${fileName}`;
      
      // Create reference and upload
      const storageRef = ref(storage, imagePath);
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Delete product image from Firebase Storage
   */
  async deleteProductImage(imagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, imagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for deletion failures as it might not exist
    }
  }

  /**
   * Upload multiple images for a product
   */
  async uploadProductImages(
    images: { square?: File; portrait?: File },
    productId: string,
    category: 'coffee' | 'bean'
  ): Promise<{ square?: string; portrait?: string }> {
    const uploadPromises: Promise<{ type: 'square' | 'portrait'; url: string }>[] = [];

    if (images.square) {
      uploadPromises.push(
        this.uploadProductImage(images.square, productId, category, 'square')
          .then(url => ({ type: 'square' as const, url }))
      );
    }

    if (images.portrait) {
      uploadPromises.push(
        this.uploadProductImage(images.portrait, productId, category, 'portrait')
          .then(url => ({ type: 'portrait' as const, url }))
      );
    }

    const results = await Promise.all(uploadPromises);
    
    return results.reduce((acc, result) => {
      acc[result.type] = result.url;
      return acc;
    }, {} as { square?: string; portrait?: string });
  }

  /**
   * Generate product ID for new products
   */
  generateProductId(category: 'coffee' | 'bean'): string {
    const prefix = category === 'coffee' ? 'C' : 'B';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Extract image path from Firebase Storage URL for deletion
   */
  extractImagePath(url: string): string | null {
    try {
      // Extract path from Firebase Storage URL
      const match = url.match(/\/o\/(.*?)\?/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (error) {
      console.error('Error extracting image path:', error);
      return null;
    }
  }
}

// Export singleton instance
export const firebaseStorageService = new FirebaseStorageService();