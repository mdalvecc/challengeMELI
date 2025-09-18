import { beforeAll, describe, expect, it } from 'vitest';
import productService from '../src/services/ProductService.js';
import questionService from '../src/services/QuestionService.js';

const PRODUCT_ID = 'MLB12345678';

describe('QuestionService', () => {
  beforeAll(async () => {
    await Promise.all([productService.initialize(), questionService.initialize()]);
  });

  it('getProductQuestions devuelve preguntas paginadas para un producto', () => {
    const res = questionService.getProductQuestions(PRODUCT_ID, { first: 2 });

    expect(res).toBeDefined();
    expect(res.totalCount).toBe(2);
    expect(res.edges.length).toBeLessThanOrEqual(2);
    expect(res.pageInfo.hasNextPage).toBeFalsy();
  });
});
