import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { firestore } from '../../infra/config/firebase';
import { Product, ProductFilters, ProductFormData, ProductSearchResult } from './types';

export class ProductRepository {
  private collectionName = 'products';

  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts(
    filters: ProductFilters = {},
    page: number = 1,
    limitCount: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<ProductSearchResult> {
    try {
      let q = query(collection(firestore, this.collectionName));

      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters.rating) {
        q = query(q, where('average_rating', '>=', filters.rating));
      }

      // Apply ordering and pagination
      q = query(q, orderBy('createdAt', 'desc'));
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      q = query(q, limit(limitCount));

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Product);
      });

      // Filter by search term if provided (client-side for now)
      let filteredProducts = products;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.ingredients.toLowerCase().includes(searchTerm)
        );
      }

      return {
        products: filteredProducts,
        total: filteredProducts.length,
        page,
        limit: limitCount
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Product;
      }

      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: ProductFormData): Promise<string> {
    try {
      const now = new Date();
      const product = {
        name: productData.name,
        description: productData.description,
        roasted: productData.roasted,
        ingredients: productData.ingredients,
        special_ingredient: productData.special_ingredient,
        type: productData.type,
        category: productData.category,
        prices: productData.prices,
        // Map image URLs to the correct field names
        imageUrlSquare: productData.images.square,
        imageUrlPortrait: productData.images.portrait,
        average_rating: 0,
        ratings_count: '0',
        favourite: false,
        index: Math.floor(Math.random() * 1000), // Temporary index generation
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(firestore, this.collectionName), product);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      
      // Convert ProductFormData to Product format
      const updateFields: any = {
        ...productData,
        updatedAt: new Date(),
      };

      // Map image URLs if provided
      if (productData.images) {
        updateFields.imageUrlSquare = productData.images.square;
        updateFields.imageUrlPortrait = productData.images.portrait;
        delete updateFields.images; // Remove the images object
      }

      // Remove imageFiles if present (not stored in Firestore)
      delete updateFields.imageFiles;

      await updateDoc(docRef, updateFields);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: 'coffee' | 'bean'): Promise<Product[]> {
    const result = await this.getProducts({ category }, 1, 100);
    return result.products;
  }

  /**
   * Search products by name
   */
  async searchProducts(searchTerm: string): Promise<Product[]> {
    const result = await this.getProducts({ search: searchTerm }, 1, 50);
    return result.products;
  }
}

// Export singleton instance
export const productRepository = new ProductRepository();
