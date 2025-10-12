/**
 * Firebase Storage Service for Product Images
 * Handles image upload, deletion, and URL generation for product images
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { storage, auth } from '../../config/firebase';

export class FirebaseStorageService {
  private readonly PRODUCTS_PATH = 'products';

  /**
   * Ensure user is authenticated with Firebase (anonymous sign-in if needed)
   */
  private async ensureAuth(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      console.log('No Firebase user found, signing in anonymously...');
      console.log('Firebase config check:', {
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain,
        apiKey: auth.app.options.apiKey ? 'Present' : 'Missing'
      });
      
      try {
        const userCredential = await signInAnonymously(auth);
        console.log('Anonymous sign-in successful:', userCredential.user.uid);
        
        // Wait a moment for auth state to fully propagate
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error('Anonymous sign-in failed:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Check if anonymous auth is disabled
        if (error.code === 'auth/operation-not-allowed') {
          throw new Error('Anonymous authentication is not enabled in Firebase Console. Please enable it in Authentication → Sign-in method → Anonymous');
        }
        
        throw new Error(`Failed to authenticate with Firebase: ${error.message}`);
      }
    } else {
      console.log('Firebase user already authenticated:', user.uid);
    }
  }

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
      // Ensure Firebase authentication
      await this.ensureAuth();
      
      console.log(`Uploading ${type} image for ${category} product ${productId}`);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      // Generate file path: products/coffee/C1/square/image.jpg
      const fileName = `image.${file.name.split('.').pop()}`;
      const imagePath = `${this.PRODUCTS_PATH}/${category}/${productId}/${type}/${fileName}`;
      
      console.log('Upload path:', imagePath);
      console.log('Storage bucket:', storage.app.options.storageBucket);
      
      // Create reference and upload
      const storageRef = ref(storage, imagePath);
      const snapshot = await uploadBytes(storageRef, file);
      
      console.log('Upload successful, getting download URL...');
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Download URL generated:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload ${type} image: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    console.log('Starting multiple image upload for product:', productId);
    console.log('Images to upload:', { 
      hasSquare: !!images.square, 
      hasPortrait: !!images.portrait 
    });

    const uploadPromises: Promise<{ type: 'square' | 'portrait'; url: string }>[] = [];

    if (images.square) {
      uploadPromises.push(
        this.uploadProductImage(images.square, productId, category, 'square')
          .then(url => ({ type: 'square' as const, url }))
          .catch(error => {
            console.error('Failed to upload square image:', error);
            throw new Error(`Square image upload failed: ${error.message}`);
          })
      );
    }

    if (images.portrait) {
      uploadPromises.push(
        this.uploadProductImage(images.portrait, productId, category, 'portrait')
          .then(url => ({ type: 'portrait' as const, url }))
          .catch(error => {
            console.error('Failed to upload portrait image:', error);
            throw new Error(`Portrait image upload failed: ${error.message}`);
          })
      );
    }

    if (uploadPromises.length === 0) {
      console.log('No images to upload');
      return {};
    }

    try {
      const results = await Promise.all(uploadPromises);
      
      const urls = results.reduce((acc, result) => {
        acc[result.type] = result.url;
        return acc;
      }, {} as { square?: string; portrait?: string });

      console.log('All images uploaded successfully:', urls);
      return urls;
    } catch (error) {
      console.error('Error in uploadProductImages:', error);
      throw error;
    }
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