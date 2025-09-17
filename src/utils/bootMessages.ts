export function logBootMessages(url: string): void {
  console.log(`Servidor GraphQL listo en ${url}`);
  console.log(`Explora la API en el Playground: ${url}`);

  console.log('\nEjemplo de consultas:');
  console.log(`- Obtener producto: {
      product(id: "MLB12345678") {
        id
        title
        priceInfo {
          price
          originalPrice
          discountPercentage
          installments {
            quantity
            amount
            total
          }
        }
        seller {
          name
          reputation
        }
      }
    }`);

  console.log(`\n- Obtener opiniones: {
      productReviews(productId: "MLB12345678", first: 2) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            rating
            title
            content
          }
        }
        summary {
          averageRating
          totalRatings
        }
      }
    }`);
}
