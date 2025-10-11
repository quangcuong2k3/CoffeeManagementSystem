import { Timestamp } from 'firebase/firestore';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ReviewFormData {
  productId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
}

export interface ReviewFilters {
  productId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
}
