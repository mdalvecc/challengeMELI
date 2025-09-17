import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import resolvers from './graphql/resolvers/product.js';
import productService from './services/ProductService.js';
import questionService from './services/QuestionService.js';
import reviewService from './services/ReviewService.js';

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar todos los archivos de esquema GraphQL
const schemaPath = path.join(__dirname, 'graphql/schema/**/*.graphql');
console.log('Loading schema files from:', schemaPath);
const typesArray = loadFilesSync(schemaPath);
console.log(`Loaded ${typesArray.length} schema files`);
const typeDefs = mergeTypeDefs(typesArray);

// Debug: Print all loaded types
const typeNames = Object.keys(
  typeDefs.definitions.reduce(
    (acc, def) => {
      if ('name' in def && def.name) {
        acc[def.name.value] = true;
      }
      return acc;
    },
    {} as Record<string, boolean>,
  ),
);
console.log('Loaded types:', typeNames.join(', '));

// Crear el esquema ejecutable
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Función para cargar datos desde un archivo JSON
async function loadJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error: unknown) {
    // TODO: ejemplo de manejo de error. Esto es solo un ejemplo y se debería mover a código común para reutilizarlo.
    if (error instanceof Error) {
      if ('extensions' in error && 'path' in error) {
        // Error de GraphQL
        const gqlError = error as {
          message: string;
          path?: string[];
          extensions?: Record<string, unknown>;
        };
        console.error(`[GraphQL Error] ${gqlError.message}`, {
          path: gqlError.path,
          code: gqlError.extensions?.code,
          file: filePath,
        });
      } else {
        // Error estándar de Node/TypeScript
        console.error(`[Error] No se pudo cargar el archivo ${filePath}:`, {
          message: error.message,
          name: error.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      }
    } else {
      // Error de tipo desconocido
      console.error(`[Error] Ocurrió un error inesperado al cargar el archivo ${filePath}:`, error);
    }
    return null;
  }
}

// Función para inicializar datos de ejemplo
async function initializeSampleData(): Promise<void> {
  const dataDir = path.join(__dirname, '../data');

  // Crear directorio de datos si no existe
  if (!fs.existsSync(dataDir)) {
    console.log('Creando directorio de datos...');
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Agregue los archivos de datos en el directorio /data');
    return;
  }

  // Definir tipos para los datos
  interface ProductData {
    products: Array<Record<string, unknown>>;
  }
  interface ReviewData {
    reviews: Array<Record<string, unknown>>;
  }
  interface QuestionData {
    questions: Array<Record<string, unknown>>;
  }

  // Cargar datos desde archivos JSON
  const productsData = await loadJsonFile<ProductData>(path.join(dataDir, 'products.json'));
  const reviewsData = await loadJsonFile<ReviewData>(path.join(dataDir, 'reviews.json'));
  const questionsData = await loadJsonFile<QuestionData>(path.join(dataDir, 'questions.json'));

  // Inicializar servicios con los datos cargados
  if (productsData?.products) {
    console.log('Datos de productos cargados correctamente');
  }

  if (reviewsData?.reviews) {
    console.log('Datos de reseñas cargados correctamente');
  }

  if (questionsData?.questions) {
    console.log('Datos de preguntas cargados correctamente');
  }

  if (questionsData?.questions) {
    console.log('Datos de preguntas cargados correctamente');
  }
}

// Inicializar los servicios
async function initializeServices(): Promise<void> {
  try {
    await Promise.all([
      productService.initialize(),
      reviewService.initialize(),
      questionService.initialize(),
    ]);

    console.log('Servicios inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar los servicios:', error);
    process.exit(1);
  }
}

// Configuración del servidor Apollo
const server = new ApolloServer({
  schema,
  context: ({ req }): { authToken: string } => ({
    // Aquí podrías agregar autenticación, autorización, etc.
    authToken: req.headers.authorization || '',
  }),
  // Habilitar introspection para que funcione el playground
  introspection: true,
  formatError: (error: GraphQLError): GraphQLFormattedError => {
    // Registrar el error en el servidor
    console.error('GraphQL Error:', error);

    // No exponer detalles internos en producción
    const isProduction = process.env.NODE_ENV === 'production';
    const message =
      isProduction && error.extensions?.code === 'INTERNAL_SERVER_ERROR'
        ? 'Ocurrió un error interno en el servidor'
        : error.message;

    const formattedError: GraphQLFormattedError = {
      message,
      ...(error.locations && { locations: error.locations }),
      ...(error.path && { path: error.path }),
      extensions: {
        ...error.extensions,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      },
    };

    return formattedError;
  },
});

// Iniciar la aplicación
async function startServer(): Promise<void> {
  try {
    // Inicializar datos de ejemplo
    await initializeSampleData();

    // Inicializar servicios
    await initializeServices();

    // Iniciar el servidor
    const PORT = process.env.PORT || 4000;
    const { url } = await server.listen({ port: PORT });

    console.log(`🚀 Servidor GraphQL listo en ${url}`);
    console.log(`🔍 Explora la API en el Playground: ${url}`);

    // Mostrar ejemplos de consultas
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
      productReviews(id: "MLB12345678", first: 2) {
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
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar la aplicación
startServer().catch(error => console.error(error));

// Manejar cierre limpio del servidor
process.on('SIGINT', () => {
  console.log('\nApagando el servidor...');
  process.exit(0);
});
