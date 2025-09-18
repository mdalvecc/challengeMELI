import { getLogger } from '@app/lib/logger.js';
import { InternalError, NotFoundError } from '@graphql/errors/errors.js';
import type { Context, Resolvers } from '@graphql/types/resolvers.js';
import productService from '@services/ProductService.js';
import questionService from '@services/QuestionService.js';
import reviewService from '@services/ReviewService.js';

export const Query: Resolvers['Query'] = {
  /**
   * Obtiene un producto por su ID
   */
  product: async (_: unknown, { id }: { id: string }, context: Context) => {
    try {
      return productService.getProductById(id);
    } catch (error) {
      getLogger(context).error({ err: error, id }, 'Error al obtener el producto');
      throw new NotFoundError('No se pudo obtener el producto', {
        requestId: context.requestId,
        details: { productId: id },
      });
    }
  },

  /**
   * Obtiene el listado de todos los productos con paginación
   */
  products: async (
    _: unknown,
    { first = 10, after }: { first?: number; after?: string },
    context: Context,
  ) => {
    try {
      return productService.getAllProducts({ first, after });
    } catch (error) {
      getLogger(context).error(
        { err: error, first, after },
        'Error al obtener el listado de productos',
      );
      throw new InternalError('No se pudo obtener el listado de productos', {
        requestId: context.requestId,
        details: { first, after },
      });
    }
  },

  /**
   * Obtiene productos del mismo vendedor
   */
  sameSellerProducts: async (
    _: unknown,
    { productId, first, after }: { productId: string; first?: number; after?: string },
    context: Context,
  ) => {
    try {
      return productService.getSameSellerProducts(productId, { first, after });
    } catch (error) {
      getLogger(context).error(
        { err: error, productId, first, after },
        'Error al obtener productos del mismo vendedor',
      );
      throw new NotFoundError('No se pudieron obtener los productos del mismo vendedor', {
        requestId: context.requestId,
        details: { productId, first, after },
      });
    }
  },

  /**
   * Obtiene productos relacionados
   */
  relatedProducts: async (
    _: unknown,
    { productId, first, after }: { productId: string; first?: number; after?: string },
    context: Context,
  ) => {
    try {
      return productService.getRelatedProducts(productId, { first, after });
    } catch (error) {
      getLogger(context).error(
        { err: error, productId, first, after },
        'Error al obtener productos relacionados',
      );
      throw new NotFoundError('No se pudieron obtener los productos relacionados', {
        requestId: context.requestId,
        details: { productId, first, after },
      });
    }
  },

  /**
   * Obtiene productos frecuentemente comprados juntos
   */
  frequentlyBoughtTogether: async (
    _: unknown,
    { productId, first = 4, after }: { productId: string; first?: number; after?: string },
    context: Context,
  ) => {
    try {
      return productService.getFrequentlyBoughtTogether(productId, { first, after });
    } catch (error) {
      getLogger(context).error(
        { err: error, productId, first, after },
        'Error al obtener productos frecuentemente comprados juntos',
      );
      throw new NotFoundError(
        'No se pudieron obtener los productos frecuentemente comprados juntos',
        {
          requestId: context.requestId,
          details: { productId, first, after },
        },
      );
    }
  },

  /**
   * Obtiene las opiniones de un producto
   */
  productReviews: async (
    _: unknown,
    { productId, first = 10, after }: { productId: string; first?: number; after?: string },
    context: Context,
  ) => {
    try {
      const connection = reviewService.getProductReviews(productId, { first, after });
      const summary = reviewService.getRatingSummary(productId);

      return {
        ...connection,
        summary,
      };
    } catch (error) {
      getLogger(context).error(
        { err: error, productId, first, after },
        'Error al obtener las opiniones del producto',
      );
      throw new NotFoundError('No se pudieron obtener las opiniones del producto', {
        requestId: context.requestId,
        details: { productId, first, after },
      });
    }
  },

  /**
   * Obtiene las preguntas de un producto
   */
  productQuestions: async (
    _: unknown,
    { productId, first = 10, after }: { productId: string; first?: number; after?: string },
    context: Context,
  ) => {
    try {
      return questionService.getProductQuestions(productId, { first, after });
    } catch (error) {
      getLogger(context).error(
        { err: error, productId, first, after },
        'Error al obtener las preguntas del producto',
      );
      throw new NotFoundError('No se pudieron obtener las preguntas del producto', {
        requestId: context.requestId,
        details: { productId, first, after },
      });
    }
  },

  /**
   * Obtiene el resumen de calificaciones de un producto
   */
  productRatingSummary: async (
    _: unknown,
    { productId }: { productId: string },
    context: Context,
  ) => {
    try {
      return reviewService.getRatingSummary(productId);
    } catch (error) {
      getLogger(context).error(
        { err: error, productId },
        'Error al obtener el resumen de calificaciones',
      );
      throw new NotFoundError('No se pudo obtener el resumen de calificaciones', {
        requestId: context.requestId,
        details: { productId },
      });
    }
  },
};

export default Query;
