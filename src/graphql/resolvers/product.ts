import type { Context, Resolvers } from '@graphql/types/resolvers.js';
import questionService from '@services/QuestionService.js';
import reviewService from '@services/ReviewService.js';

// Resolvers para el tipo Product
const Product: Resolvers['Product'] = {
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
};

export default Product;
