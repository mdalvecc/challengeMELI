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
    expect(summary.averageRating).toBe(4.5);
    expect(summary.totalRatings).toBe(2);
    expect(summary.ratings).toHaveProperty('oneStar', 0);
    expect(summary.ratings).toHaveProperty('twoStars', 0);
    expect(summary.ratings).toHaveProperty('threeStars', 0);
    expect(summary.ratings).toHaveProperty('fourStars', 1);
    expect(summary.ratings).toHaveProperty('fiveStars', 1);
  });
});
