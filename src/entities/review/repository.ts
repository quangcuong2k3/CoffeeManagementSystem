    import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  collectionGroup
} from 'firebase/firestore';
import { firestore } from '../../infra/config/firebase';
import { Review, ReviewFilters } from './types';

class ReviewRepository {
  /**
   * Convert Firestore document to Review object
   */
  private convertToReview(id: string, data: any, productId?: string): Review {
    return {
      id,
      productId: productId || data.product_id || data.productId || data.productID || '',
      userId: data.user_id || data.userId || data.userID || '',
      userName: data.user_name || data.userName || 'Anonymous',
      userAvatar: data.user_avatar || data.userAvatar,
      rating: data.rating || 0,
      comment: data.content || data.comment || data.title || '',
      createdAt: data.created_at?.toDate?.() || data.createdAt?.toDate?.() || data.createddate?.toDate?.() || new Date(),
      updatedAt: data.updated_at?.toDate?.() || data.updatedAt?.toDate?.() || data.updateddate?.toDate?.()
    };
  }

  /**
   * Get reviews by product ID from product subcollections
   * Reviews are stored in: coffees/{productId}/reviews or beans/{productId}/reviews
   */
  async getReviewsByProductId(productId: string): Promise<Review[]> {
    try {
      const reviews: Review[] = [];
      
      // Try fetching from coffees collection
      const coffeesReviewsRef = collection(firestore, 'coffees', productId, 'reviews');
      const coffeesSnapshot = await getDocs(coffeesReviewsRef);
      coffeesSnapshot.docs.forEach(doc => {
        reviews.push(this.convertToReview(doc.id, doc.data(), productId));
      });

      // Try fetching from beans collection
      const beansReviewsRef = collection(firestore, 'beans', productId, 'reviews');
      const beansSnapshot = await getDocs(beansReviewsRef);
      beansSnapshot.docs.forEach(doc => {
        reviews.push(this.convertToReview(doc.id, doc.data(), productId));
      });

      // Sort by date descending
      return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching reviews by product ID:', error);
      return [];
    }
  }

  /**
   * Get reviews by user ID across all products
   */
  async getReviewsByUserId(userId: string): Promise<Review[]> {
    try {
      const reviews: Review[] = [];
      
      // Get all reviews from coffees subcollections
      const coffeesRef = collection(firestore, 'coffees');
      const coffeesSnapshot = await getDocs(coffeesRef);
      
      for (const coffeeDoc of coffeesSnapshot.docs) {
        const reviewsRef = collection(firestore, 'coffees', coffeeDoc.id, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsRef);
        
        reviewsSnapshot.docs.forEach(reviewDoc => {
          const data = reviewDoc.data();
          const reviewUserId = data.user_id || data.userId || data.userID || '';
          if (reviewUserId === userId) {
            reviews.push(this.convertToReview(reviewDoc.id, data, coffeeDoc.id));
          }
        });
      }

      // Get all reviews from beans subcollections
      const beansRef = collection(firestore, 'beans');
      const beansSnapshot = await getDocs(beansRef);
      
      for (const beanDoc of beansSnapshot.docs) {
        const reviewsRef = collection(firestore, 'beans', beanDoc.id, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsRef);
        
        reviewsSnapshot.docs.forEach(reviewDoc => {
          const data = reviewDoc.data();
          const reviewUserId = data.user_id || data.userId || data.userID || '';
          if (reviewUserId === userId) {
            reviews.push(this.convertToReview(reviewDoc.id, data, beanDoc.id));
          }
        });
      }

      return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching reviews by user ID:', error);
      return [];
    }
  }

  /**
   * Get all reviews with optional filters
   */
  async getReviews(filters: ReviewFilters = {}): Promise<Review[]> {
    try {
      // If productId is specified, use the optimized method
      if (filters.productId) {
        const reviews = await this.getReviewsByProductId(filters.productId);
        
        // Apply other filters
        return reviews.filter(review => {
          if (filters.userId && review.userId !== filters.userId) return false;
          if (filters.minRating && review.rating < filters.minRating) return false;
          if (filters.maxRating && review.rating > filters.maxRating) return false;
          return true;
        });
      }

      // If userId is specified, use that method
      if (filters.userId) {
        const reviews = await this.getReviewsByUserId(filters.userId);
        
        // Apply other filters
        return reviews.filter(review => {
          if (filters.minRating && review.rating < filters.minRating) return false;
          if (filters.maxRating && review.rating > filters.maxRating) return false;
          return true;
        });
      }

      // Otherwise, get all reviews from all products
      const allReviews: Review[] = [];
      
      // Get from coffees
      const coffeesRef = collection(firestore, 'coffees');
      const coffeesSnapshot = await getDocs(coffeesRef);
      for (const coffeeDoc of coffeesSnapshot.docs) {
        const reviewsRef = collection(firestore, 'coffees', coffeeDoc.id, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsRef);
        reviewsSnapshot.docs.forEach(reviewDoc => {
          allReviews.push(this.convertToReview(reviewDoc.id, reviewDoc.data(), coffeeDoc.id));
        });
      }

      // Get from beans
      const beansRef = collection(firestore, 'beans');
      const beansSnapshot = await getDocs(beansRef);
      for (const beanDoc of beansSnapshot.docs) {
        const reviewsRef = collection(firestore, 'beans', beanDoc.id, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsRef);
        reviewsSnapshot.docs.forEach(reviewDoc => {
          allReviews.push(this.convertToReview(reviewDoc.id, reviewDoc.data(), beanDoc.id));
        });
      }

      // Apply filters
      return allReviews
        .filter(review => {
          if (filters.minRating && review.rating < filters.minRating) return false;
          if (filters.maxRating && review.rating > filters.maxRating) return false;
          return true;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  /**
   * Get average rating for a product
   */
  async getAverageRating(productId: string): Promise<number> {
    try {
      const reviews = await this.getReviewsByProductId(productId);
      if (reviews.length === 0) return 0;

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      return totalRating / reviews.length;
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return 0;
    }
  }
}

export const reviewRepository = new ReviewRepository();
