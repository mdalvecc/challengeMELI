import {
  ID,
  Product,
  Question,
  RatingSummary,
  Review,
  type Answer,
  type Author,
  type Nullable,
  type PageInfo,
} from '@app-types/index.js';
import { IResolvers } from '@graphql-tools/utils';
import { DateTimeResolver } from 'graphql-scalars';

// Context type for GraphQL resolvers
export interface Context {
  authToken?: string;
}

// Pagination arguments for GraphQL queries
export interface PaginationArgs {
  first?: number;
  after?: string;
}

// Product related resolver types
export type ProductResolvers = IResolvers & {
  Query: {
    product: (_: unknown, args: { id: ID }, context: Context) => Promise<Product>;
    sameSellerProducts: (
      _: unknown,
      args: { productId: ID } & PaginationArgs,
      context: Context,
    ) => Promise<{ edges: Array<{ node: Product; cursor: string }>; pageInfo: PageInfo }>;
    relatedProducts: (
      _: unknown,
      args: { productId: ID } & PaginationArgs,
      context: Context,
    ) => Promise<{ edges: Array<{ node: Product; cursor: string }>; pageInfo: PageInfo }>;
    frequentlyBoughtTogether: (
      _: unknown,
      args: { productId: ID } & PaginationArgs,
      context: Context,
    ) => Promise<{ edges: Array<{ node: Product; cursor: string }>; pageInfo: PageInfo }>;
    productReviews: (
      _: unknown,
      args: { productId: ID } & PaginationArgs,
      context: Context,
    ) => Promise<{
      edges: Array<{ node: Review; cursor: string }>;
      pageInfo: PageInfo;
      summary: RatingSummary;
    }>;
    productQuestions: (
      _: unknown,
      args: { productId: ID } & PaginationArgs,
      context: Context,
    ) => Promise<{
      edges: Array<{ node: Question; cursor: string }>;
      pageInfo: PageInfo;
    }>;
    productRatingSummary: (
      _: unknown,
      args: { productId: ID },
      context: Context,
    ) => Promise<RatingSummary>;
    products: (
      _: unknown,
      args: PaginationArgs,
      context: Context,
    ) => Promise<{ edges: Array<{ node: Product; cursor: string }>; pageInfo: PageInfo }>;
  };
  Product: {
    questions: (
      product: Product,
      args: PaginationArgs,
      context: Context,
    ) => Promise<{
      edges: Array<{ node: Question; cursor: string }>;
      pageInfo: PageInfo;
    }>;
    reviews: (
      product: Product,
      args: PaginationArgs,
      context: Context,
    ) => Promise<{
      edges: Array<{ node: Review; cursor: string }>;
      pageInfo: PageInfo;
      summary: RatingSummary;
    }>;
    ratingSummary: (product: Product, _: unknown, context: Context) => Promise<RatingSummary>;
  };

  Review: {
    product: (review: Review, _: unknown, context: Context) => Promise<Product>;
    author: (review: Review, _: unknown, context: Context) => Promise<Author>;
  };

  Question: {
    product: (question: Question, _: unknown, context: Context) => Promise<Product>;
    author: (question: Question, _: unknown, context: Context) => Promise<Author>;
    answer: (question: Question, _: unknown, context: Context) => Promise<Nullable<Answer>>;
  };
};

// Add Date scalar resolver
export const scalarResolvers = {
  Date: DateTimeResolver,
};

export type Resolvers = ProductResolvers;
