import { beforeAll, describe, expect, it } from 'vitest';
import { createServer } from '@app/server';
import { initializeServices } from '@services/init';

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
            category { id name }
            seller { id name }
            priceInfo { price currency }
          }
        }
      `,
      variables: { id: PRODUCT_ID },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.product).toBeDefined();
    expect(res.data?.product.id).toBe(PRODUCT_ID);
  });

  it('Query.productReviews incluye summary y edges paginados', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query ProductReviews($productId: ID!, $first: Int) {
          productReviews(productId: $productId, first: $first) {
            totalCount
            summary { averageRating totalRatings }
            edges { node { id rating } }
            pageInfo { hasNextPage }
          }
        }
      `,
      variables: { productId: PRODUCT_ID, first: 2 },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.productReviews).toBeDefined();
    expect(res.data?.productReviews.edges.length).toBeLessThanOrEqual(2);
  });

  it('Query.productQuestions devuelve preguntas paginadas', async () => {
    const res = await server.executeOperation({
      query: /* GraphQL */ `
        query ProductQuestions($productId: ID!, $first: Int) {
          productQuestions(productId: $productId, first: $first) {
            totalCount
            edges { node { id question status } }
            pageInfo { hasNextPage }
          }
        }
      `,
      variables: { productId: PRODUCT_ID, first: 2 },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.productQuestions).toBeDefined();
    expect(res.data?.productQuestions.edges.length).toBeLessThanOrEqual(2);
  });
});
