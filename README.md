# Challenge MELI — API de Detalle de Productos

Este proyecto implementa una API GraphQL que expone el detalle de productos de Mercado Libre, con soporte para reseñas, preguntas, vendedores, categorías y listados relacionados (mismo vendedor, relacionados, comprados juntos). Está desarrollado en TypeScript sobre Apollo Server y utiliza archivos JSON como fuente de datos mock.

## Stack técnico
- Node.js (ESM)
- TypeScript
- Apollo Server 3
- GraphQL 16
- graphql-codegen (tipos TS para resolvers y schema)
- Vitest (tests unitarios e integración) + cobertura (`@vitest/coverage-v8`)
- Pino (logging estructurado, pretty en dev)
- ESLint + Prettier + Husky

## Motivación
Elegí este stack porque ya lo venía utilizando en proyectos recientes y me permitía avanzar rápido dentro del tiempo limitado del challenge. Además, ofrece flexibilidad, gran soporte de la comunidad, amplia documentación y facilita el mantenimiento.

La principal ventaja de GraphQL en este contexto es que permite a los clientes obtener exactamente los datos que necesitan, evitando respuestas innecesariamente grandes o incompletas. Para demostrar esto, construí distintos endpoints que cubren varios escenarios de uso.

El objetivo de este proyecto es mostrar mis conocimientos técnicos y mi capacidad para resolver problemas complejos. Quise mostrar distintos aspectos del desarrollo: arquitectura, separación de responsabilidades, manejo de errores, paginación, logging, entre otros.

Si bien GraphQL no era la tecnología en la que me siento más fuerte, quise aprovechar la oportunidad para consolidar mi experiencia y aprender más en profundidad ya que me gusta aprender cosas nuevas. Durante el desarrollo utilicé Windsurf, lo que me permitió optimizar tiempos y enfocarme en entregar la mayor cantidad posible de funcionalidades.

Soy consciente de que hay aspectos que pueden mejorarse, los cuales detallo al final de este documento. Aprecio mucho cualquier feedback adicional que puedan darme, ya que lo considero fundamental para seguir creciendo.

## Estructura principal del proyecto
```
src/
  data/                   # Datos mock en JSON (products, reviews, questions, sellers, categories)
  graphql/
    schema/               # Esquema GraphQL modularizado con sus tipos
    resolvers/            # Resolvers agrupados por tipo o dominio
    errors/               # Formateo centralizado de errores y excepciones comunes
    generated/            # Tipos generados por graphql-codegen (si aplica)
    types/                # Tipos auxiliares para context, resolvers, etc.
  services/               # Capa de negocio con múltiples servicios
  index.ts                # Bootstrap de la app (carga services + server.listen)
  server.ts               # Creación de ApolloServer (schema, resolvers, context)
  tests/                  # Tests unitarios e integración
```

## Decisiones de arquitectura
- **GraphQL modular**: los distintos tipos están separados por dominio en `schema/types/*.graphql`. Esto facilita la evolución del esquema y la separación de responsabilidades.
- **Capa de servicios**: centraliza lógica de negocio y acceso a datos mock. Permite swap por un datasource real sin tocar resolvers.
- **TypeScript estricto**: los tipos de dominio se generan en base a los tipos de los resolvers de GraphQL (`src/graphql/generated/types.ts`). Esto evita duplicar código y evitar errores.
- **Manejo de errores y logging**: centralizado y con formato uniforme.
- **Development Experience**: proveo un conjunto variado de scripts `dev`, `build`, `start`, linters, formatter y hooks de `husky`.
- **Tests**: Se utiliza [Vitest https://vitest.dev](https://vitest.dev). Los tests se ubican en `tests/` y no se incluyen en el build ni en Docker ya que tienen su configuración independiente.

## Diseño de la API (GraphQL)
La API sigue un diseño fuertemente tipado, con paginación estilo "connections" (`edges`, `pageInfo`, `totalCount`) teniendo en cuenta que la cantidad de datos existentes es muy grande.
Se exponen tipos de dominio: `Product`, `ProductPreview`, `Seller`, `Category`, `Review`, `Question`, además de tipos auxiliares (`RatingSummary`, `PriceInfo`, `ShippingInfo`, etc.).
Los listados paginados aceptan `first` y `after` (para indicar la cantidad de elementos por página y un cursor simple con id de último elemento en la página).
Implementé un dataloader de GraphQL para productos, de forma de evitar problemas de performance cuando el mismo producto se resuelve desde distintas entidades GraphQL en el mismo request.

### Endpoints (Queries principales)
Creé varios endpoints para poder consultar la información de los productos, sus reseñas, preguntas asociadas y demás datos.

Están definidos y documentados en `src/graphql/schema/types/resolvers.ts` e implementados en `src/graphql/resolvers/index.ts`.

Los más importantes son `products(first: Int, after: String): ProductConnection!` y `product(id: ID!): Product`, para listar productos de forma paginado u obtener un producto por su id.

### Ejemplos de queries
Ver `RUN.md` para ejemplos prácticos con variables y ejecución.

## Paginación
Los servicios exponen métodos que retornan un objeto `Connection` que indica la cantidad de entidades en total, los elementos en la página actual y el cursor para la siguiente página. Es una forma bastante standard en GraphQL para paginar resultados.

## Manejo de errores y logging
Implementé un logging estructurado con Pino, que es una librería muy standard para Node.js. Tuve en cuenta algunos detalles al momento de loguear información:
  - se enmascaran algunos headers sensibles (Authorization, Cookie).
  - se inyectan atributos `requestId` y `logger` en el objeto de contexto de Apollo para poder hacer una correlación de logs por request, de forma de poder rastrear los logs de un request particular.

En los endpoints se realiza una validación de validez de los IDs recibidos

Agregué manejo de errores consistentes en el proyecto, de forma que todos los errores tengan un formato uniforme y sean tipados, en lugar de errores genéricos.

## Setup del proyecto
1. Requisitos
   - Node.js >= 20
   - npm >= 8
2. Instalación
   ```bash
   npm install
   ```
3. Variables de entorno
   - `.env` soporte via `dotenv`. Variables opcionales:
     - `PORT` (default: 4000)
     - `LOG_LEVEL` (default: `debug` en dev, `info` en prod)
     - `SERVICE_NAME` (default: `challenge-meli-api`)
4. Generación de tipos (opcional, ya incluido en build)
   ```bash
   npm run codegen
   ```
5. Build + Start (producción)
```bash
npm run build
npm start
```
6. Desarrollo
   ```bash
   npm run dev
   # o con watch de los cambios en los archivos del proyecto
   npm run dev:watch
   ```
7. Tests y cobertura
```bash
npm test               # ejecuta la suite
npm run test:coverage  # genera reporte de cobertura
```

Más detalles operativos y ejemplos de consultas en `RUN.md`.

## Alcance del challenge
A continuación detallo qué puntos quedaron cubiertos (según mi criterio) y cuáles se consideran mejoras opcionales.

### Implementado
- Endpoints GraphQL principales para los tipos de dominio
- Paginación.
- Capa de servicios con datos mock y lógica desacoplada de los resolvers.
- Cache por request con DataLoader para `Product`
- Tests unitarios y de integración (Vitest)
- Logging
- Dockerfile

### Mejoras / Opcionales
- Búsqueda de productos con filtros y ordenamientos (texto, categoría, condición, rango de precio, sort).
- Implementar estrategias de cache como Redis, caches en memoria, dataloaders, etc
- Mejorar el constructor base de los servicios para que reciba un datasource como parámetro en lugar de un archivo de forma de poder inyectar un datasource real.
- Métricas y trazas (OpenTelemetry) con correlación de `traceId/spanId` en logs.
- Casos extra de tests (más paginación, validación de argumentos) y reportes de cobertura por umbral.
- Búsqueda por texto y filtros avanzados en `products`/`searchProducts`.
- Configuración para pipeline de CI.
