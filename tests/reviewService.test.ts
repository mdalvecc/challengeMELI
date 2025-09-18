import reviewService from '@services/ReviewService';
import { beforeAll, describe, expect, it } from 'vitest';

const PRODUCT_ID = 'MLB12345678';

describe('ReviewService', () => {
  beforeAll(async () => {
    await reviewService.initialize();
  });

  it('getProductReviews devuelve reseñas paginadas para un producto', () => {
    const res = reviewService.getProductReviews(PRODUCT_ID, { first: 2 });
    expect(res).toBeDefined();
    expect(res.totalCount).toBeGreaterThan(0);
    expect(res.edges.length).toBeLessThanOrEqual(2);
    expect(res.pageInfo).toBeDefined();
  });

  it('getRatingSummary calcula correctamente el promedio y el desglose', () => {
    const summary = reviewService.getRatingSummary(PRODUCT_ID);
    expect(summary).toBeDefined();
    expect(summary.averageRating).toBeGreaterThanOrEqual(0);
    expect(summary.totalRatings).toBeGreaterThanOrEqual(0);
    expect(summary.ratings).toHaveProperty('oneStar');
    expect(summary.ratings).toHaveProperty('twoStars');
    expect(summary.ratings).toHaveProperty('threeStars');
    expect(summary.ratings).toHaveProperty('fourStars');
    expect(summary.ratings).toHaveProperty('fiveStars');
  });
});
