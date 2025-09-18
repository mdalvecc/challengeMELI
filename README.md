# Challenge MELI — API GraphQL de Detalle de Productos

Este proyecto implementa una API GraphQL que expone el detalle de productos de Mercado Libre, con soporte para reseñas, preguntas, vendedor, categorías y listados relacionados (mismo vendedor, relacionados, comprados juntos). Está desarrollado en TypeScript sobre Apollo Server y utiliza archivos JSON como fuente de datos mock.

## Stack técnico
- Node.js (ESM)
- TypeScript
- Apollo Server 3
- GraphQL 16
- @graphql-tools (carga y merge de schemas)
- graphql-codegen (tipos TS para resolvers y schema)
- DataLoader (batch/ cache por request de `Product`)
- ESLint + Prettier + Husky

## Estructura del proyecto
```
src/
  data/                 # Datos mock en JSON (products, reviews, questions, sellers, categories)
  graphql/
    schema/             # Esquema GraphQL modularizado en .graphql
      schema.graphql
      types/
        base.graphql
        product.graphql
        review.graphql
        question.graphql
        seller.graphql
    resolvers/          # Resolvers agrupados por tipo o dominio
      index.ts
      query.ts
      product.ts
      productPreview.ts
      review.ts
      question.ts
    generated/          # Tipos generados por graphql-codegen
    types/              # Tipos auxiliares para context, resolvers, etc.
  services/             # Capa de negocio y acceso a datos mock
    BaseService.ts
    ProductService.ts
    ReviewService.ts
    QuestionService.ts
    SellerService.ts
    CategoryService.ts
    init.ts
  utils/                # Utilidades (logs de boot, formatError, etc.)
  index.ts              # Bootstrap de la app (carga services + server.listen)
  server.ts             # Creación de ApolloServer (schema, resolvers, context)

codegen.yml             # Config de graphql-codegen
package.json            # Scripts de build/dev/lint
```

## Diseño de la API (GraphQL)
- La API sigue un diseño fuertemente tipado, con paginación estilo "connections" (`edges`, `pageInfo`, `totalCount`).
- Se exponen tipos de dominio: `Product`, `ProductPreview`, `Seller`, `Category`, `Review`, `Question`, además de tipos auxiliares (`RatingSummary`, `PriceInfo`, `ShippingInfo`, etc.).
- Los listados paginados aceptan `first` y `after` (cursor base64 simple) y devuelven `PageInfo`.

### Endpoints (Queries principales)
Definidos en `src/graphql/schema/types/base.graphql` y resueltos en `src/graphql/resolvers/query.ts`:
- `product(id: ID!): Product`
- `products(first: Int = 10, after: String): ProductConnection!`
- `sameSellerProducts(productId: ID!, first: Int = 10, after: String): ProductConnection!`
- `relatedProducts(productId: ID!, first: Int = 10, after: String): ProductConnection!`
- `frequentlyBoughtTogether(productId: ID!, first: Int = 5, after: String): ProductConnection!`
- `productReviews(productId: ID!, first: Int = 10, after: String): ReviewConnection!` (incluye `summary`)
- `productQuestions(productId: ID!, first: Int = 10, after: String): QuestionConnection!`
- `productRatingSummary(productId: ID!): RatingSummary!`

Además, `Product` expone campos con resolvers propios:
- `Product.ratingSummary: RatingSummary`
- `Product.reviews(first, after): ReviewConnection`
- `Product.questions(first, after): QuestionConnection`

### Ejemplos de queries
Ver `RUN.md` para ejemplos prácticos con variables y ejecución.

## Paginación y modelo de datos
- Los servicios exponen métodos que retornan `Connection<T>` utilizando `BaseService.createConnection`.
- `ProductService` implementa:
  - `getProductById(id)`
  - `getAllProducts({ first, after })`
  - `getSameSellerProducts(productId, { first, after })`
  - `getRelatedProducts(productId, { first, after })`
  - `getFrequentlyBoughtTogether(productId, { first, after })`
- `ReviewService` y `QuestionService` implementan listados paginados por `productId` y cálculo de `RatingSummary`.

## Manejo de errores
- Los errores se formatean con `formatError` (`src/graphql/errors/formatError.ts` si aplica) y logging básico con `console.error` en resolvers.
- Validación de IDs y existencia de entidades en la capa `BaseService`.

## Performance
- `DataLoader` en `context` para `Product` (`src/server.ts`), evitando N+1 en resoluciones de `product` desde `Review` y `Question`.
- Tipos generados por codegen para mayor seguridad en resolvers.

## Decisiones de arquitectura
- **GraphQL modular**: tipos separados por dominio en `schema/types/*.graphql` y mergeado con `@graphql-tools`.
- **Capa de servicios**: centraliza lógica de negocio y acceso a datos mock. Permite swap por un datasource real sin tocar resolvers.
- **TypeScript estricto**: codegen de tipos de resolvers (`src/graphql/generated/types.ts`) y tipos de dominio (`src/types/index.ts`).
- **ES Modules**: `type: module`, rutas con path mapping (tsconfig) y `tsc-alias` post build.
- **DX**: scripts `dev`, `build`, `start`, linters, formatter y hooks de `husky`.

## Setup del proyecto
1. Requisitos
   - Node.js >= 16
   - npm >= 8
2. Instalación
   ```bash
   npm install
   ```
3. Variables de entorno
   - `.env` soporte via `dotenv`. Variables opcionales:
     - `PORT` (default: 4000)
4. Generación de tipos (opcional, ya versionado)
   ```bash
   npm run codegen
   ```
5. Desarrollo
   ```bash
   npm run dev
   # o con watch de la entry
   npm run dev:watch
   ```
6. Build + Start (producción)
   ```bash
   npm run build
   npm start
   ```

Más detalles operativos y ejemplos de consultas en `RUN.md`.

## Futuras mejoras
- Exponer queries de `Seller` y `Category` si el alcance lo requiere.
- Búsqueda por texto y filtros avanzados en `products`/`searchProducts`.
- Tests unitarios e integración (servicios y resolvers).
- Dockerfile/Compose y pipeline de CI.
