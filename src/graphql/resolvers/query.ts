import type { Context, Resolvers } from '@graphql/types/resolvers.js';
import productService from '@services/ProductService.js';
import questionService from '@services/QuestionService.js';
import reviewService from '@services/ReviewService.js';

export const Query: Resolvers['Query'] = {
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
   * Obtiene el listado de todos los productos con paginación
   */
  products: async (
    _: unknown,
    { first = 10, after }: { first?: number; after?: string },
    _context: Context,
  ) => {
    try {
      return productService.getAllProducts({ first, after });
    } catch (error) {
      console.error('Error al obtener el listado de productos:', error);
      throw new Error('No se pudo obtener el listado de productos');
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
    { productId, first = 4, after }: { productId: string; first?: number; after?: string },
    _context: Context,
  ) => {
    try {
      return productService.getFrequentlyBoughtTogether(productId, { first, after });
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
    { productId, first = 10, after }: { productId: string; first?: number; after?: string },
    _context: Context,
  ) => {
    try {
      return questionService.getProductQuestions(productId, { first, after });
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
};

export default Query;
