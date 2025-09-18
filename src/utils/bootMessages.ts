import { logger } from '@app/lib/logger.js';

export function logBootMessages(url: string): void {
  logger.info({ url }, `Servidor GraphQL listo`);
  logger.info({ url }, `Explora la API en el Playground`);

  logger.info('\nEjemplo de consultas:');
  logger.info(
    `- Obtener producto: {\n  product(id: "MLB12345678") {\n    id\n    title\n    priceInfo {\n      price\n      originalPrice\n      discountPercentage\n      installments { quantity amount total }\n    }\n    seller { name reputation }\n  }\n}`,
  );

  logger.info(
    `\n- Obtener opiniones: {\n  productReviews(productId: "MLB12345678", first: 2) {\n    totalCount\n    pageInfo { hasNextPage endCursor }\n    edges { node { rating title content } }\n    summary { averageRating totalRatings }\n  }\n}`,
  );
}
