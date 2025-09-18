import { beforeAll, describe, expect, it } from 'vitest';
import productService from '../src/services/ProductService.js';

const PRODUCT_ID = 'MLB12345678';

describe('ProductService', () => {
  beforeAll(async () => {
    await productService.initialize();
  });

  it('getProductById devuelve el producto esperado', () => {
    const product = productService.getProductById(PRODUCT_ID);

    expect(product).toBeDefined();
    expect(product.id).toBe(PRODUCT_ID);
    expect(product.title).toBe('Smartphone XYZ Pro 128GB');
  });

  it('getAllProducts aplica paginación (first)', () => {
    const page = productService.getAllProducts({ first: 3 });

    expect(page.totalCount).toBe(9);
    expect(page.edges.length).toBeLessThanOrEqual(3);
    expect(page.pageInfo).toBeDefined();
    expect(page.pageInfo.hasNextPage).toBeTruthy();
  });

  it('paginación con cursor (after) devuelve la siguiente página', () => {
    const firstPage = productService.getAllProducts({ first: 1 });

    expect(firstPage.edges.length).toBe(1);
    const after = firstPage.edges[0].cursor;

    const secondPage = productService.getAllProducts({ first: 1, after });
    // Si hay al menos 2 productos, debería devolver otro edge
    if (firstPage.totalCount > 1) {
      expect(secondPage.edges.length).toBe(1);
      // El cursor debe ser distinto al de la primera página
      expect(secondPage.edges[0].cursor).not.toBe(after);
    } else {
      // Si solo hay uno, no hay next page
      expect(secondPage.edges.length).toBe(0);
    }
  });

  it('getFrequentlyBoughtTogether devuelve una conexión válida', () => {
    const fbt = productService.getFrequentlyBoughtTogether(PRODUCT_ID, { first: 3 });

    expect(fbt).toBeDefined();
    expect(fbt.totalCount).toBe(0);
    expect(fbt.edges.length).toBe(0);
  });

  describe('Casos de error', () => {
    it('getProductById lanza error con ID inexistente', () => {
      expect(() => productService.getProductById('ID_INEXISTENTE')).toThrowError();
    });

    it('getAllProducts con cursor after inválido vuelve al inicio', () => {
      const page = productService.getAllProducts({ first: 2, after: 'CURSOR_INVALIDO' });
      expect(page.pageInfo.hasPreviousPage).toBe(false);
      expect(page.edges.length).toBeLessThanOrEqual(2);
    });

    it('getFrequentlyBoughtTogether lanza error si el producto no existe', () => {
      expect(() =>
        productService.getFrequentlyBoughtTogether('ID_INEXISTENTE', { first: 2 }),
      ).toThrowError();
    });
  });
});
