import { reviewRepository } from '../../../entities/review/repository';
import { Review, ReviewFilters } from '../../../entities/review/types';

class ReviewService {
  /**
   * Get reviews for a specific product
   */
  async getProductReviews(productId: string): Promise<Review[]> {
    if (!productId || productId.trim() === '') {
      throw new Error('Product ID is required');
    }

    return await reviewRepository.getReviewsByProductId(productId);
  }

  /**
   * Get reviews by user
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    return await reviewRepository.getReviewsByUserId(userId);
  }

  /**
   * Get all reviews with filters
   */
  async getReviews(filters: ReviewFilters = {}): Promise<Review[]> {
    return await reviewRepository.getReviews(filters);
  }

  /**
   * Get review statistics for a product
   */
  async getProductReviewStats(productId: string) {
    const reviews = await this.getProductReviews(productId);

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution: {
        5: ratingDistribution[5] || 0,
        4: ratingDistribution[4] || 0,
        3: ratingDistribution[3] || 0,
        2: ratingDistribution[2] || 0,
        1: ratingDistribution[1] || 0
      }
    };
  }
}

export const reviewService = new ReviewService();
