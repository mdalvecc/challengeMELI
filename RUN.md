# Runbook — Cómo ejecutar y probar la API

Este documento explica cómo levantar la API GraphQL en local y cómo probar los endpoints con ejemplos de consultas.

## Prerrequisitos
- Node.js >= 16
- npm >= 8

## Instalación
```bash
npm install
```

## Variables de entorno
Crea un archivo `.env` en la raíz si necesitás personalizar el puerto:
```
PORT=4000
```

## Desarrollo (hot reload)
```bash
npm run dev
```
La app arranca en `http://localhost:4000/`. Apollo Server expone el Playground (introspection: true). Podés abrir el navegador y ejecutar consultas.

## Build y ejecución de producción
```bash
npm run build
npm start
```
Esto compila a `dist/` y levanta `node dist/index.js`.

## Ejecución con Docker
Construí la imagen (multi-stage) y corré el contenedor:

```bash
docker build -t challenge-meli .
docker run --rm -p 4000:4000 challenge-meli
```

La API quedará disponible en `http://localhost:4000/`.

Podés cambiar el puerto publicando otro y/o seteando la variable `PORT` dentro del contenedor:

```bash
# Publicar en 8080 mapeando el mismo puerto del contenedor
docker run --rm -p 8080:8080 -e PORT=8080 challenge-meli
```

Si necesitás usar tu `.env` local, podés montarlo en el contenedor:

```bash
docker run --rm -p 4000:4000 \
  -v "$(pwd)/.env:/app/.env:ro" \
  challenge-meli
```

## Scripts útiles
- `npm run codegen`: genera tipos TS desde los `.graphql` hacia `src/graphql/generated/types.ts`.
- `npm run lint` / `npm run lint:fix`: linter.
- `npm run format`: formatea el código con Prettier.

## Ejemplos de consultas
A continuación, algunas queries útiles para probar la API. Reemplazá los IDs por los presentes en `src/data/products.json`.

### Obtener un producto por ID
```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    title
    condition
    images
    category { id name }
    seller { id name reputation }
    priceInfo { price currency discountPercentage }
    soldQuantity
    availableQuantity
    ratingSummary { averageRating totalRatings }
  }
}
```
Variables:
```json
{ "id": "P001" }
```

### Listado paginado de productos
```graphql
query ListProducts($first: Int, $after: String) {
  products(first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      cursor
      node { id title priceInfo { price currency } }
    }
  }
}
```
Variables:
```json
{ "first": 5 }
```

### Productos del mismo vendedor
```graphql
query SameSeller($productId: ID!, $first: Int, $after: String) {
  sameSellerProducts(productId: $productId, first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      node { id title seller { id name } }
      cursor
    }
  }
}
```
Variables:
```json
{ "productId": "P001", "first": 5 }
```

### Productos relacionados
```graphql
query Related($productId: ID!, $first: Int, $after: String) {
  relatedProducts(productId: $productId, first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      node { id title category { id name } }
      cursor
    }
  }
}
```

### Frecuentemente comprados juntos
```graphql
query FBT($productId: ID!, $first: Int, $after: String) {
  frequentlyBoughtTogether(productId: $productId, first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      node { id title priceInfo { price } }
      cursor
    }
  }
}
```

### Opiniones de un producto (con summary)
```graphql
query ProductReviews($productId: ID!, $first: Int, $after: String) {
  productReviews(productId: $productId, first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage endCursor }
    summary {
      averageRating
      totalRatings
      ratings { oneStar twoStars threeStars fourStars fiveStars }
    }
    edges {
      cursor
      node {
        id
        rating
        title
        content
        date
        verifiedPurchase
        author { id name }
        product { id title }
      }
    }
  }
}
```

### Preguntas de un producto
```graphql
query ProductQuestions($productId: ID!, $first: Int, $after: String) {
  productQuestions(productId: $productId, first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      cursor
      node {
        id
        question
        status
        date
        author { id name }
        answer { id content date author { id name } }
        product { id title }
      }
    }
  }
}
```

### Resumen de calificaciones
```graphql
query RatingSummary($productId: ID!) {
  productRatingSummary(productId: $productId) {
    averageRating
    totalRatings
    ratings { oneStar twoStars threeStars fourStars fiveStars }
  }
}
```

## Tips
- El Playground permite inspeccionar el schema y el autocompletado.
- Si ves errores de import en tiempo de ejecución, asegurate de usar `npm run dev` (que configura `tsx` ESM) o construir antes de `npm start`.
- Ante errores de tipado, ejecutá `npm run codegen` y `npm run type-check`.
