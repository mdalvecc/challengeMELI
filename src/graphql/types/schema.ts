import { Product, Question, RatingSummary, Review } from '@app-types/index.js';

// Connection types for pagination
export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface ProductConnection extends Connection<Product> {
  edges: Edge<Product>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface ReviewConnection extends Connection<Review> {
  edges: Edge<Review>[];
  pageInfo: PageInfo;
  totalCount: number;
  summary: RatingSummary;
}

export interface QuestionConnection extends Connection<Question> {
  edges: Edge<Question>[];
  pageInfo: PageInfo;
  totalCount: number;
}

// Type for the GraphQL context
export interface GraphQLContext {
  authToken?: string;
}
