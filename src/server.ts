import path from 'path';
import { fileURLToPath } from 'url';

import type { Product } from '@app-types/index.js';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import formatGraphQLError from '@graphql/errors/formatError.js';
import resolvers from '@graphql/resolvers/index.js';
import type { Context } from '@graphql/types/resolvers.js';
import productService from '@services/ProductService.js';
import { ApolloServer } from 'apollo-server';
import DataLoader from 'dataloader';

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar y combinar los archivos de esquema GraphQL
const typeDefs = mergeTypeDefs(loadFilesSync(path.join(__dirname, 'graphql/schema/**/*.graphql')));

// Crear el esquema ejecutable
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Crear y devolver la instancia del servidor Apollo sin iniciar el listen
export async function createServer(): Promise<ApolloServer> {
  const server = new ApolloServer({
    schema,
    context: ({ req }): Context => {
      const productLoader = new DataLoader<string, Product>(async ids => {
        return ids.map(id => productService.getProductById(id));
      });
      return {
        authToken: (req?.headers?.authorization as string) || '',
        productLoader,
      };
    },
    // Habilitar introspection para que funcione el playground
    introspection: true,
    formatError: formatGraphQLError,
  });

  return server;
}
