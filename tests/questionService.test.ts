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
    expect(res.totalCount).toBeGreaterThanOrEqual(0);
    expect(res.edges.length).toBeLessThanOrEqual(2);
    expect(res.pageInfo).toBeDefined();
  });

  describe('Casos de error', () => {
    it('getProductQuestions lanza error si el producto no existe', () => {
      expect(() =>
        questionService.getProductQuestions('ID_INEXISTENTE', { first: 1 }),
      ).toThrowError();
    });

    it('getProductQuestions con cursor after inválido vuelve al inicio', () => {
      const res = questionService.getProductQuestions(PRODUCT_ID, { first: 1, after: 'CURSOR_X' });
      expect(res.pageInfo.hasPreviousPage).toBe(false);
      expect(res.edges.length).toBeLessThanOrEqual(1);
    });
  });
});
