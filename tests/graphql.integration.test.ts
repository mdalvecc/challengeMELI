import { beforeAll, describe, expect, it } from 'vitest';
import { createServer } from '../src/server.js';
import { initializeServices } from '../src/services/init.js';

const PRODUCT_ID = 'MLB12345678';

let server: Awaited<ReturnType<typeof createServer>>;

describe('GraphQL API (integration)', () => {
  beforeAll(async () => {
    await initializeServices();
    server = await createServer();
  });

  it('Query.product devuelve datos básicos del producto', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
            condition
            category {
              id
              name
            }
            seller {
              id
              name
            }
            priceInfo {
              price
              currency
            }
          }
        }
      `,
      variables: { id: PRODUCT_ID },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.product).toBeDefined();
    expect(res.data?.product.id).toBe(PRODUCT_ID);
  });

  it('Query.product devuelve error', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
          }
        }
      `,
      variables: { id: `${PRODUCT_ID}invalid` },
    });

    expect(res.errors).toBeDefined();
    expect(res.data?.product).toBeNull();
    expect(res.errors?.[0].message).toBe(`No se pudo obtener el producto`);
  });

  it('Query.productReviews incluye summary y edges paginados', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query ProductReviews($productId: ID!, $first: Int) {
          productReviews(productId: $productId, first: $first) {
            totalCount
            summary {
              averageRating
              totalRatings
            }
            edges {
              node {
                id
                rating
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      `,
      variables: { productId: PRODUCT_ID, first: 2 },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.productReviews).toBeDefined();
    expect(res.data?.productReviews.edges.length).toBe(2);
  });

  it('Query.productQuestions devuelve preguntas paginadas', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query ProductQuestions($productId: ID!, $first: Int) {
          productQuestions(productId: $productId, first: $first) {
            totalCount
            edges {
              node {
                id
                question
                status
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      `,
      variables: { productId: PRODUCT_ID, first: 2 },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.productQuestions).toBeDefined();
    expect(res.data?.productQuestions.edges.length).toBe(2);
  });

  it('Query.products pagina con after válido', async () => {
    // Primero obtenemos la primera página para capturar un cursor válido
    const first = await server.executeOperation({
      query: /* GraphQL */ `
        query ($first: Int) {
          products(first: $first) {
            totalCount
            edges {
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      `,
      variables: { first: 1 },
    });

    expect(first.errors).toBeUndefined();
    const after = first.data?.products.edges?.[0]?.cursor as string;

    const second = await server.executeOperation({
      query: /* GraphQL */ `
        query ($first: Int, $after: String) {
          products(first: $first, after: $after) {
            edges {
              cursor
            }
            pageInfo {
              hasPreviousPage
            }
          }
        }
      `,
      variables: { first: 1, after },
    });

    expect(second.errors).toBeUndefined();
    expect(second.data?.products.pageInfo.hasPreviousPage).toBe(true);
    expect(second.data?.products.edges.length).toBeLessThanOrEqual(1);
  });

  it('Query.products con after inválido vuelve al inicio', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query ($first: Int, $after: String) {
          products(first: $first, after: $after) {
            edges {
              cursor
            }
            pageInfo {
              hasPreviousPage
            }
          }
        }
      `,
      variables: { first: 2, after: 'CURSOR_INVALIDO' },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.products.pageInfo.hasPreviousPage).toBe(false);
    expect(res.data?.products.edges.length).toBeLessThanOrEqual(2);
  });

  it('Query.sameSellerProducts devuelve productos del mismo vendedor', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query ($id: ID!, $first: Int) {
          sameSellerProducts(productId: $id, first: $first) {
            totalCount
            edges {
              node {
                id
                seller {
                  id
                }
              }
            }
          }
        }
      `,
      variables: { id: PRODUCT_ID, first: 2 },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.sameSellerProducts).toBeDefined();
    expect(res.data?.sameSellerProducts.edges.length).toBeLessThanOrEqual(2);
  });

  it('Query.relatedProducts devuelve productos relacionados', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query ($id: ID!, $first: Int) {
          relatedProducts(productId: $id, first: $first) {
            totalCount
            edges {
              node {
                id
                category {
                  id
                }
              }
            }
          }
        }
      `,
      variables: { id: PRODUCT_ID, first: 2 },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.relatedProducts).toBeDefined();
    expect(res.data?.relatedProducts.edges.length).toBeLessThanOrEqual(2);
  });

  it('Query.frequentlyBoughtTogether devuelve conexión (puede estar vacía)', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query ($id: ID!, $first: Int) {
          frequentlyBoughtTogether(productId: $id, first: $first) {
            totalCount
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      variables: { id: PRODUCT_ID, first: 3 },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.frequentlyBoughtTogether).toBeDefined();
    expect(res.data?.frequentlyBoughtTogether.edges.length).toBeLessThanOrEqual(3);
  });
});
