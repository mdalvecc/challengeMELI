import { beforeAll, describe, expect, it } from 'vitest';
import questionService from '@services/QuestionService';
import productService from '@services/ProductService';

const PRODUCT_ID = 'MLB12345678';

describe('QuestionService', () => {
  beforeAll(async () => {
    await Promise.all([
      productService.initialize(),
      questionService.initialize(),
    ]);
  });

  it('getProductQuestions devuelve preguntas paginadas para un producto', () => {
    const res = questionService.getProductQuestions(PRODUCT_ID, { first: 2 });
    expect(res).toBeDefined();
    expect(res.totalCount).toBeGreaterThanOrEqual(0);
    expect(res.edges.length).toBeLessThanOrEqual(2);
    expect(res.pageInfo).toBeDefined();
  });
});
