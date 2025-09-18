# Runbook — Cómo ejecutar y probar la API

Este documento explica cómo levantar la API GraphQL en local y cómo probar los endpoints con ejemplos de consultas.

El proyecto está subido en [Github: https://github.com/mdalvecc/challengeMELI](https://github.com/mdalvecc/challengeMELI).

## Prerrequisitos
- Node.js >= 20
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

## Desarrollo
Para ejecutar la aplicación en modo hot reload para que se recargue automáticamente al detectar cambios en el código:
```bash
npm run dev:watch
```
sino simplemente se puede ejecutar con 
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

## Ejecución con Docker Compose
Podés levantar todo más rápido con docker-compose usando el archivo `docker-compose.yml` incluido.

```bash
docker compose up -d --build
# o, si ya está construida:
docker compose up -d
```
Esto construye la imagen con el Dockerfile y levanta el servicio `api`. Quedará en `http://localhost:${PORT-4000}`.

Variables soportadas (pueden ir en `.env` o inline):
- `PORT` (por defecto 4000)
- `LOG_LEVEL` (por defecto `info`)
- `SERVICE_NAME` (por defecto `challenge-meli-api`)

Para bajar los servicios:
```bash
docker compose down
```

## Ejecución con Docker (sin docker compose)
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
docker run --rm -p 4000:4000 -v "$(pwd)/.env:/app/.env:ro" challenge-meli
```

## Scripts útiles
- `npm run lint` / `npm run lint:fix`: linter.
- `npm run format`: formatea el código con Prettier.
- `npm test`: ejecuta la suite de tests con Vitest.
- `npm run test:coverage`: genera reporte de cobertura con `@vitest/coverage-v8`.

## Ejemplos de consultas
A continuación, algunas queries útiles para probar la API. Reemplazá los IDs por los presentes en `src/data/products.json`.

### Obtener todos los productos paginados
```graphql
query GetProducts($first: Int, $after: String) {
  products(first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
    edges {
      node { id title description condition priceInfo { price currency } }
      cursor
    }
  }
}
```

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
{ "id": "MLB12345678" }
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
{ "productId": "MLB12345678", "first": 5 }
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

## Tips
- El Playground permite inspeccionar el schema y el autocompletado.

## Tests con Vitest
Los tests están configurados con Vitest y se ubican en `tests/`.

Comandos:
```bash
npm test           # ejecuta la suite una vez en modo CI
npm run test:coverage  # cobertura de código
```
