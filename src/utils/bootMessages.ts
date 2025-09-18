import { logger } from '@app/lib/logger.js';

export function logBootMessages(url: string): void {
  logger.info({ url }, `Servidor GraphQL listo`);
  logger.info({ url }, `Explora la API en el Playground`);

  logger.info('\nEjemplo de consultas:');
  logger.info(`
  - Obtener producto:
  {
    product(id: "MLB12345678") {
      id
      title
      priceInfo {
        price
        originalPrice
        discountPercentage
        installments { quantity amount total }
      }
      seller { name reputation }
    }
  }
  `);

  logger.info(`
  - Obtener opiniones:
  {
    productReviews(productId: "MLB12345678", first: 2) {
      totalCount
      pageInfo { hasNextPage endCursor }
      edges { node { rating title content } }
      summary { averageRating totalRatings }
    }
  }
  `);
}
