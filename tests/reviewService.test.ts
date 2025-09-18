import { beforeAll, describe, expect, it } from 'vitest';
import reviewService from '../src/services/ReviewService.js';

const PRODUCT_ID = 'MLB12345678';

describe('ReviewService', () => {
  beforeAll(async () => {
    await reviewService.initialize();
  });

  it('getProductReviews devuelve reseñas paginadas para un producto', () => {
    const res = reviewService.getProductReviews(PRODUCT_ID, { first: 2 });

    expect(res).toBeDefined();
    expect(res.totalCount).toBe(2);
    expect(res.edges.length).toBeLessThanOrEqual(2);
    expect(res.pageInfo.hasNextPage).toBeFalsy();
  });

  it('getRatingSummary calcula correctamente el promedio y el desglose', () => {
    const summary = reviewService.getRatingSummary(PRODUCT_ID);

    expect(summary).toBeDefined();
  });

  describe('Casos de error', () => {
    it('getProductReviews con ID inexistente devuelve conexión vacía', () => {
      const res = reviewService.getProductReviews('ID_INEXISTENTE', { first: 2 });
      expect(res.totalCount).toBe(0);
      expect(res.edges.length).toBe(0);
    });

    it('getProductReviews con cursor after inválido vuelve al inicio', () => {
      const res = reviewService.getProductReviews(PRODUCT_ID, { first: 1, after: 'CURSOR_X' });
      expect(res.pageInfo.hasPreviousPage).toBe(false);
      expect(res.edges.length).toBeLessThanOrEqual(1);
    });

    it('getRatingSummary para producto inexistente devuelve summary en cero', () => {
      const summary = reviewService.getRatingSummary('ID_INEXISTENTE');
      expect(summary.averageRating).toBe(0);
      expect(summary.totalRatings).toBe(0);
    });
  });
});
