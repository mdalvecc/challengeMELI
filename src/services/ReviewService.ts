import { Connection, ID, PaginationOptions, RatingSummary, Review } from '@app-types/index.js';
import BaseService from './BaseService.js';

/**
 * Servicio para manejar la lógica de negocio de opiniones
 */
class ReviewService extends BaseService<{ reviews: Review[] }> {
  constructor() {
    super('reviews.json');
  }

  /**
   * Obtiene las opiniones de un producto
   * @param id - ID del producto
   * @param pagination - Opciones de paginación
   * @returns Conexión con las opiniones
   */
  public getProductReviews(
    id: ID,
    pagination: PaginationOptions = { first: 10 },
  ): Connection<Review> {
    this.validateId(id);

    const reviews = this.data?.reviews || [];
    const productReviews = reviews.filter(review => review.product.id === id);

    // Ordenar por fecha (más recientes primero)
    productReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return this.createConnection<Review>(productReviews, pagination);
  }

  /**
   * Obtiene el resumen de calificaciones de un producto
   * @param id - ID del producto
   * @returns Resumen de calificaciones
   */
  public getRatingSummary(id: ID): RatingSummary {
    this.validateId(id);

    const reviews = this.data?.reviews || [];
    const productReviews = reviews.filter(review => review.product.id === id);

    if (productReviews.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratings: {
          oneStar: 0,
          twoStars: 0,
          threeStars: 0,
          fourStars: 0,
          fiveStars: 0,
        },
      };
    }

    const ratings = {
      oneStar: 0,
      twoStars: 0,
      threeStars: 0,
      fourStars: 0,
      fiveStars: 0,
    };

    let totalRating = 0;

    productReviews.forEach(review => {
      totalRating += review.rating;

      switch (review.rating) {
        case 1:
          ratings.oneStar++;
          break;
        case 2:
          ratings.twoStars++;
          break;
        case 3:
          ratings.threeStars++;
          break;
        case 4:
          ratings.fourStars++;
          break;
        case 5:
          ratings.fiveStars++;
          break;
      }
    });

    const averageRating = totalRating / productReviews.length;

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings: productReviews.length,
      ratings,
    };
  }
}

// Exportar una instancia del servicio
const reviewService = new ReviewService();
export default reviewService;
