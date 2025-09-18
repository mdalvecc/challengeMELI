import type { Author, ProductPreview, Review as ReviewType } from '@app-types/index.js';
import { getLogger } from '@app/lib/logger.js';
import { InternalError, NotFoundError } from '@graphql/errors/errors.js';
import type { Context, Resolvers } from '@graphql/types/resolvers.js';
import productService from '@services/ProductService.js';

const Review: Resolvers['Review'] = {
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
  product: async (
    review: ReviewType,
    _args: unknown,
    context: Context,
  ): Promise<ProductPreview> => {
    try {
      if (review.product) {
        const p = review.product;
        const full = context.productLoader
          ? await context.productLoader.load(p.id)
          : productService.getProductById(p.id);
        const merged: ProductPreview = {
          id: full.id,
          title: p.title ?? full.title,
          images: full.images,
          category: full.category,
          seller: full.seller,
          priceInfo: full.priceInfo,
          paymentMethods: full.paymentMethods,
        };
        Object.assign(p, merged);
        return merged;
      }
      throw new NotFoundError('La reseña no contiene el producto resuelto');
    } catch (error) {
      getLogger(context).error(
        { err: error, reviewId: review.id, productId: review.product?.id },
        'Error al obtener el producto de la reseña',
      );
      throw new InternalError('No se pudo obtener el producto de la reseña');
    }
  },
};

export default Review;
