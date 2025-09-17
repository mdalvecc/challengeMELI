import type { Answer, Author, Nullable, Product, Question, Review } from '@app-types/index.js';
import type { Context, Resolvers } from '@graphql/types/resolvers.js';
import productService from '@services/ProductService.js';
import questionService from '@services/QuestionService.js';
import reviewService from '@services/ReviewService.js';
import { DateTimeResolver } from 'graphql-scalars';

// Implement the resolvers with proper types
const resolvers: Resolvers = {
  // Scalar resolvers
  Date: DateTimeResolver,
  Query: {
    /**
     * Obtiene un producto por su ID
     */
    product: async (_: unknown, { id }: { id: string }, _context: Context) => {
      try {
        return productService.getProductById(id);
      } catch (error) {
        console.error('Error al obtener el producto:', error);
        throw new Error('No se pudo obtener el producto');
      }
    },

    /**
     * Obtiene productos del mismo vendedor
     */
    sameSellerProducts: async (
      _: unknown,
      { productId, first, after }: { productId: string; first?: number; after?: string },
      _context: Context,
    ) => {
      try {
        return productService.getSameSellerProducts(productId, { first, after });
      } catch (error) {
        console.error('Error al obtener productos del mismo vendedor:', error);
        throw new Error('No se pudieron obtener los productos del mismo vendedor');
      }
    },

    /**
     * Obtiene productos relacionados
     */
    relatedProducts: async (
      _: unknown,
      { productId, first, after }: { productId: string; first?: number; after?: string },
      _context: Context,
    ) => {
      try {
        return productService.getRelatedProducts(productId, { first, after });
      } catch (error) {
        console.error('Error al obtener productos relacionados:', error);
        throw new Error('No se pudieron obtener los productos relacionados');
      }
    },

    /**
     * Obtiene productos frecuentemente comprados juntos
     */
    frequentlyBoughtTogether: async (
      _: unknown,
      { productId, limit = 4 }: { productId: string; limit?: number },
      _context: Context,
    ) => {
      try {
        return productService.getFrequentlyBoughtTogether(productId, { first: limit });
      } catch (error) {
        console.error('Error al obtener productos frecuentemente comprados juntos:', error);
        throw new Error('No se pudieron obtener los productos frecuentemente comprados juntos');
      }
    },

    /**
     * Obtiene las opiniones de un producto
     */
    productReviews: async (
      _: unknown,
      { productId, first = 10, after }: { productId: string; first?: number; after?: string },
      _context: Context,
    ) => {
      try {
        const connection = reviewService.getProductReviews(productId, { first, after });
        const summary = reviewService.getRatingSummary(productId);

        return {
          ...connection,
          summary,
        };
      } catch (error) {
        console.error('Error al obtener las opiniones del producto:', error);
        throw new Error('No se pudieron obtener las opiniones del producto');
      }
    },

    /**
     * Obtiene las preguntas de un producto
     */
    productQuestions: async (
      _: unknown,
      {
        productId,
        first = 10,
        after,
        onlyAnswered = true,
      }: { productId: string; first?: number; after?: string; onlyAnswered?: boolean },
      _context: Context,
    ) => {
      try {
        return questionService.getProductQuestions(productId, { first, after }, onlyAnswered);
      } catch (error) {
        console.error('Error al obtener las preguntas del producto:', error);
        throw new Error('No se pudieron obtener las preguntas del producto');
      }
    },

    /**
     * Obtiene el resumen de calificaciones de un producto
     */
    productRatingSummary: async (
      _: unknown,
      { productId }: { productId: string },
      _context: Context,
    ) => {
      try {
        return reviewService.getRatingSummary(productId);
      } catch (error) {
        console.error('Error al obtener el resumen de calificaciones:', error);
        throw new Error('No se pudo obtener el resumen de calificaciones');
      }
    },
  },

  /**
   * Resolvers para el tipo Product
   */
  Product: {
    /**
     * Obtiene el resumen de calificaciones de un producto
     */
    ratingSummary: async (product: { id: string }, _args: unknown, _context: Context) => {
      return reviewService.getRatingSummary(product.id);
    },

    /**
     * Obtiene las preguntas de un producto
     */
    questions: async (
      product: { id: string },
      { first = 10, after }: { first?: number; after?: string; onlyAnswered?: boolean },
      _context: Context,
    ) => {
      try {
        return questionService.getProductQuestions(product.id, { first, after });
      } catch (error) {
        console.error('Error al obtener las preguntas del producto:', error);
        throw new Error('No se pudieron obtener las preguntas del producto');
      }
    },

    /**
     * Obtiene las opiniones de un producto
     */
    reviews: async (
      product: { id: string },
      { first = 10, after }: { first?: number; after?: string },
      _context: Context,
    ) => {
      try {
        const connection = reviewService.getProductReviews(product.id, { first, after });
        const summary = reviewService.getRatingSummary(product.id);

        return {
          ...connection,
          summary,
        };
      } catch (error) {
        console.error('Error al obtener las opiniones del producto:', error);
        throw new Error('No se pudieron obtener las opiniones del producto');
      }
    },
  },

  /**
   * Resolvers para el tipo Review
   */
  Review: {
    /**
     * Resuelve el autor de una reseña
     */
    author: (review: { author: Author }) =>
      Promise.resolve({
        id: review.author.id,
        name: review.author.name,
      }),

    /**
     * Resuelve el producto de una reseña
     */
    product: async (review: Review): Promise<Product> => {
      try {
        if (review.product) return review.product;
        throw new Error('La reseña no contiene el producto resuelto');
      } catch (error) {
        console.error('Error al obtener el producto de la reseña:', error);
        throw new Error('No se pudo obtener el producto de la reseña');
      }
    },
  },

  /**
   * Resolvers para el tipo Question
   */
  Question: {
    /**
     * Resuelve el autor de una pregunta
     */
    author: (question: { author: Author }) =>
      Promise.resolve({
        id: question.author.id,
        name: question.author.name,
      }),

    /**
     * Resuelve el producto de una pregunta
     */
    product: async (question: Question): Promise<Product> => {
      try {
        if (question.product) return question.product;
        throw new Error('La pregunta no contiene el producto resuelto');
      } catch (error) {
        console.error('Error al obtener el producto de la pregunta:', error);
        throw new Error('No se pudo obtener el producto de la pregunta');
      }
    },

    /**
     * Resuelve las respuestas a una pregunta
     */
    answer: (question: Question): Promise<Nullable<Answer>> => {
      return Promise.resolve(question.answer);
    },
  },
};

export default resolvers;
