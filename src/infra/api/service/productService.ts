import { Product, ProductFormData, ProductFilters, ProductSearchResult } from '../../../entities/product/types';
import { productRepository } from '../../../entities/product/repository';
import { firebaseStorageService } from './firebaseStorageService';

/**
 * Product Service - Business Logic Layer
 * Handles all business rules and operations for products
 */
export class ProductService {
  
  /**
   * Get all products with filtering, validation, and business rules
   */
  async getProducts(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ProductSearchResult> {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20;

    // Validate price range
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (min < 0 || max < 0 || min > max) {
        throw new Error('Invalid price range');
      }
    }

    const result = await productRepository.getProducts(filters, page, limit);
    
    // Apply business logic - price filtering (done client-side for now)
    if (filters.priceRange) {
      result.products = this.filterByPriceRange(result.products, filters.priceRange);
      result.total = result.products.length;
    }

    return result;
  }

  /**
   * Get product by ID with validation
   */
  async getProductById(id: string): Promise<Product | null> {
    if (!id || id.trim() === '') {
      throw new Error('Product ID is required');
    }

    return await productRepository.getProductById(id);
  }

  /**
   * Create a new product with validation
   */
  async createProduct(productData: ProductFormData): Promise<string> {
    // Validate required fields (for creation)
    this.validateProductData(productData, false);

    // Business rule: Check for duplicate product names
    const existingProducts = await productRepository.searchProducts(productData.name);
    const duplicateProduct = existingProducts.find(p => 
      p.name.toLowerCase() === productData.name.toLowerCase()
    );

    if (duplicateProduct) {
      throw new Error('A product with this name already exists');
    }

    // Business rule: Validate price data
    this.validatePrices(productData.prices);

    // First, create the product to get an ID (without images)
    const tempProductData = {
      ...productData,
      images: {
        square: '',
        portrait: ''
      }
    };
    delete tempProductData.imageFiles; // Remove imageFiles from the data sent to Firestore

    const productId = await productRepository.createProduct(tempProductData);

    // Now upload images using the generated product ID
    try {
      if (productData.imageFiles && (productData.imageFiles.square || productData.imageFiles.portrait)) {
        console.log('Uploading images for product:', productId);
        
        const imageUrls = await firebaseStorageService.uploadProductImages(
          productData.imageFiles,
          productId,
          productData.category
        );

        console.log('Image upload results:', imageUrls);

        // Update product with uploaded image URLs
        const updateData: Partial<ProductFormData> = {
          images: {
            square: imageUrls.square || '',
            portrait: imageUrls.portrait || ''
          }
        };

        await productRepository.updateProduct(productId, updateData);
        console.log('Product updated with image URLs');
      }
    } catch (error) {
      console.error('Error uploading product images:', error);
      // Throw the error so the user knows there was an issue
      throw new Error(`Product created but failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return productId;
  }

  /**
   * Update an existing product with validation
   */
  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Product ID is required');
    }

    // Check if product exists
    const existingProduct = await productRepository.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Validate updated data
    if (productData.name || productData.description || productData.type || productData.category) {
      // Create a complete object for validation if key fields are being updated
      const validationData: ProductFormData = {
        name: productData.name || existingProduct.name,
        description: productData.description || existingProduct.description,
        roasted: productData.roasted || existingProduct.roasted,
        ingredients: productData.ingredients || existingProduct.ingredients,
        special_ingredient: productData.special_ingredient || existingProduct.special_ingredient,
        type: productData.type || existingProduct.type,
        category: productData.category || existingProduct.category,
        prices: productData.prices || existingProduct.prices,
        images: productData.images || {
          square: existingProduct.imageUrlSquare,
          portrait: existingProduct.imageUrlPortrait
        },
        imageFiles: productData.imageFiles
      };
      
      this.validateProductData(validationData, true);
    }
    
    if (productData.prices) {
      this.validatePrices(productData.prices);
    }

    // Business rule: Check for name conflicts (if name is being updated)
    if (productData.name && productData.name !== existingProduct.name) {
      const duplicateProducts = await productRepository.searchProducts(productData.name);
      const duplicateProduct = duplicateProducts.find(p => 
        p.id !== id && p.name.toLowerCase() === productData.name!.toLowerCase()
      );

      if (duplicateProduct) {
        throw new Error('A product with this name already exists');
      }
    }

    // Prepare update data
    const updateData = { ...productData };
    
    try {
      // Handle image uploads if new images are provided
      if (productData.imageFiles && (productData.imageFiles.square || productData.imageFiles.portrait)) {
        console.log('Updating product images for:', id);
        
        // Delete old images if they exist and new ones are being uploaded
        if (existingProduct.imageUrlSquare && productData.imageFiles.square) {
          const oldSquarePath = firebaseStorageService.extractImagePath(existingProduct.imageUrlSquare);
          if (oldSquarePath) {
            try {
              await firebaseStorageService.deleteProductImage(oldSquarePath);
              console.log('Deleted old square image');
            } catch (error) {
              console.warn('Failed to delete old square image:', error);
            }
          }
        }
        
        if (existingProduct.imageUrlPortrait && productData.imageFiles.portrait) {
          const oldPortraitPath = firebaseStorageService.extractImagePath(existingProduct.imageUrlPortrait);
          if (oldPortraitPath) {
            try {
              await firebaseStorageService.deleteProductImage(oldPortraitPath);
              console.log('Deleted old portrait image');
            } catch (error) {
              console.warn('Failed to delete old portrait image:', error);
            }
          }
        }

        // Upload new images
        const imageUrls = await firebaseStorageService.uploadProductImages(
          productData.imageFiles,
          id,
          existingProduct.category
        );

        console.log('New image URLs:', imageUrls);

        // Initialize images object if it doesn't exist
        if (!updateData.images) {
          updateData.images = {
            square: existingProduct.imageUrlSquare || '',
            portrait: existingProduct.imageUrlPortrait || ''
          };
        }
        
        // Update with new image URLs
        if (imageUrls.square) {
          updateData.images.square = imageUrls.square;
        }
        if (imageUrls.portrait) {
          updateData.images.portrait = imageUrls.portrait;
        }
      }

      // Remove imageFiles from update data as it's not part of the Firestore schema
      delete updateData.imageFiles;

      await productRepository.updateProduct(id, updateData);
      console.log('Product updated successfully');
    } catch (error) {
      console.error('Error updating product with images:', error);
      throw new Error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a product with business rules
   */
  async deleteProduct(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Product ID is required');
    }

    // Check if product exists
    const existingProduct = await productRepository.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Business rule: Check if product is referenced in orders
    // This would require checking the orders collection
    // For now, we'll allow deletion but this should be implemented
    
    await productRepository.deleteProduct(id);
  }

  /**
   * Get featured products (business logic for determining featured items)
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const result = await productRepository.getProducts({}, 1, 50);
    
    // Business logic: Featured products are high-rated items
    const featuredProducts = result.products
      .filter(product => product.average_rating >= 4.0)
      .sort((a, b) => b.average_rating - a.average_rating)
      .slice(0, limit);

    return featuredProducts;
  }

  /**
   * Get products by category with business rules
   */
  async getProductsByCategory(category: 'coffee' | 'bean'): Promise<Product[]> {
    return await productRepository.getProductsByCategory(category);
  }

  /**
   * Search products with enhanced business logic
   */
  async searchProducts(searchTerm: string, filters: ProductFilters = {}): Promise<Product[]> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    const searchFilters = { ...filters, search: searchTerm.trim() };
    const result = await productRepository.getProducts(searchFilters, 1, 50);
    
    return result.products;
  }

  /**
   * Calculate product statistics
   */
  async getProductStats() {
    const allProducts = await productRepository.getProducts({}, 1, 1000);
    
    const stats = {
      totalProducts: allProducts.total,
      coffeeCount: allProducts.products.filter(p => p.category === 'coffee').length,
      beanCount: allProducts.products.filter(p => p.category === 'bean').length,
      averageRating: this.calculateAverageRating(allProducts.products),
      priceRange: this.calculatePriceRange(allProducts.products)
    };

    return stats;
  }

  // Private helper methods

  private validateProductData(productData: ProductFormData, isUpdate: boolean = false): void {
    if (!productData.name || productData.name.trim() === '') {
      throw new Error('Product name is required');
    }

    if (!productData.description || productData.description.trim() === '') {
      throw new Error('Product description is required');
    }

    if (!productData.type || !['Coffee', 'Bean'].includes(productData.type)) {
      throw new Error('Product type must be Coffee or Bean');
    }

    if (!productData.category || !['coffee', 'bean'].includes(productData.category)) {
      throw new Error('Product category must be coffee or bean');
    }

    if (!productData.prices || productData.prices.length === 0) {
      throw new Error('At least one price must be specified');
    }

    // Only validate images for new products, not updates
    if (!isUpdate) {
      const hasNewSquareImage = productData.imageFiles?.square;
      const hasNewPortraitImage = productData.imageFiles?.portrait;

      if (!hasNewSquareImage) {
        throw new Error('Square image is required. Please upload a square format image.');
      }

      if (!hasNewPortraitImage) {
        throw new Error('Portrait image is required. Please upload a portrait format image.');
      }
    }
  }

  private validatePrices(prices: any[]): void {
    if (!Array.isArray(prices) || prices.length === 0) {
      throw new Error('Prices array is required and must not be empty');
    }

    for (const price of prices) {
      if (!price.size || price.size.trim() === '') {
        throw new Error('Price size is required');
      }

      if (!price.price || isNaN(parseFloat(price.price)) || parseFloat(price.price) <= 0) {
        throw new Error('Valid price amount is required');
      }

      if (!price.currency || price.currency.trim() === '') {
        throw new Error('Price currency is required');
      }
    }
  }

  private filterByPriceRange(products: Product[], priceRange: { min: number; max: number }): Product[] {
    return products.filter(product => {
      // Get minimum price for the product
      const minPrice = Math.min(...product.prices.map(p => parseFloat(p.price)));
      return minPrice >= priceRange.min && minPrice <= priceRange.max;
    });
  }

  private calculateAverageRating(products: Product[]): number {
    if (products.length === 0) return 0;
    
    const totalRating = products.reduce((sum, product) => sum + product.average_rating, 0);
    return parseFloat((totalRating / products.length).toFixed(2));
  }

  private calculatePriceRange(products: Product[]): { min: number; max: number } {
    if (products.length === 0) return { min: 0, max: 0 };

    const allPrices = products.flatMap(product => 
      product.prices.map(p => parseFloat(p.price))
    );

    return {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices)
    };
  }
}

// Export singleton instance
export const productService = new ProductService();