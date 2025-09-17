import path from 'path';
import { fileURLToPath } from 'url';

import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server';

import formatGraphQLError from './graphql/errors/formatError.js';

import resolvers from './graphql/resolvers/index.js';

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
    context: ({ req }): { authToken: string } => ({
      // Aquí podrías agregar autenticación, autorización, etc.
      authToken: req.headers.authorization || '',
    }),
    // Habilitar introspection para que funcione el playground
    introspection: true,
    formatError: formatGraphQLError,
  });

  return server;
}
