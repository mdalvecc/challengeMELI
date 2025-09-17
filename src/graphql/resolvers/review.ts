import type { Author, Product, Review as ReviewType } from '@app-types/index.js';
import type { Resolvers } from '@graphql/types/resolvers.js';

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
  product: async (review: ReviewType): Promise<Product> => {
    try {
      if (review.product) return review.product;
      throw new Error('La reseña no contiene el producto resuelto');
    } catch (error) {
      console.error('Error al obtener el producto de la reseña:', error);
      throw new Error('No se pudo obtener el producto de la reseña');
    }
  },
};

export default Review;
