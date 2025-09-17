import path from 'path';

import { Connection, Edge, ID, PaginationOptions } from '@app-types/index.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Base service types
export type BaseData = ({ id: string } & Record<string, unknown>) | Record<string, never>;

/**
 * Clase base para todos los servicios con manejo de datos en archivos JSON
 * @template T - Tipo de datos manejados por el servicio
 */
export default abstract class BaseService<BaseData> {
  protected data?: BaseData;
  private dataFile: string;
  private dataDir: string;

  /**
   * Crea una nueva instancia del servicio
   * @param dataFile - Nombre del archivo de datos (debe estar en la carpeta data)
   */
  constructor(dataFile: string) {
    this.dataFile = dataFile;
    this.dataDir = path.join(__dirname, '../data');
  }

  /**
   * Inicializa el servicio cargando los datos desde el archivo
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadData();
    } catch (error) {
      console.error(`Error al cargar ${this.dataFile}:`, error);
      throw error;
    }
  }

  /**
   * Crea una conexión paginada a partir de un array de elementos
   * @param items - Array de elementos a paginar
   * @param options - Opciones de paginación
   * @returns Conexión paginada
   */
  protected createConnection<U extends { id: string }>(
    items: U[],
    options: PaginationOptions = { first: 10 },
  ): Connection<U> {
    const { first = 10, after } = options;
    let startIndex = 0;

    // Si hay un cursor, buscar a partir de ese índice
    if (after) {
      const afterIndex = items.findIndex(item => this.getItemId(item) === after);
      if (afterIndex >= 0) {
        startIndex = afterIndex + 1;
      }
    }

    // Obtener los elementos de la página actual
    const paginatedItems = items.slice(startIndex, startIndex + first);

    // Crear los edges
    const edges: Edge<U>[] = paginatedItems.map(item => ({
      node: item,
      cursor: this.getItemId(item),
    }));

    // Calcular la información de la página
    const hasNextPage = startIndex + first < items.length;
    const hasPreviousPage = startIndex > 0;
    const startCursor = edges[0]?.cursor;
    const endCursor = edges[edges.length - 1]?.cursor;

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor: hasPreviousPage ? startCursor : undefined,
        endCursor: hasNextPage ? endCursor : undefined,
      },
      totalCount: items.length,
    };
  }

  /**
   * Obtiene el ID de un elemento
   * @param item - Elemento del que se quiere obtener el ID
   * @returns ID del elemento
   */
  protected getItemId<T extends { id: string }>(item: T): string {
    return item.id;
  }

  /**
   * Carga los datos desde el archivo JSON
   */
  private async loadData(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, this.dataFile);
      const data = await fs.readFile(filePath, 'utf-8');
      this.data = JSON.parse(data);
      console.log(`Datos desde ${this.dataFile} cargados correctamente`);
    } catch (error) {
      // TODO: esto es solo un ejemplo de manejo de error y se debería mover a código común para reutilizarlo.
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
            file: this.dataFile,
          });
        } else {
          // Error estándar de Node/TypeScript
          console.error(`[Error] No se pudo cargar el archivo ${this.dataFile}:`, {
            message: error.message,
            name: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          });
        }
      } else {
        // Error de tipo desconocido
        console.error(
          `[Error] Ocurrió un error inesperado al cargar el archivo ${this.dataFile}:`,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Busca un elemento por su ID
   * @param id - ID del elemento a buscar
   * @param collection - Nombre de la colección donde buscar
   * @returns Elemento encontrado
   * @throws Error si el elemento no se encuentra
   */
  protected findById<U extends { id: string }>(id: ID, collection: keyof BaseData): U {
    if (!this.data) {
      throw new Error('Los datos no han sido cargados. Por favor, llame a initialize primero.');
    }

    const items = this.data[collection] as U[] | undefined;
    if (!items) {
      throw new Error(`La colección ${String(collection)} no existe`);
    }

    const item = items.find(item => item.id === id);
    if (!item) {
      throw new Error(`${String(collection)} con ID ${id} no encontrado`);
    }

    return item;
  }

  /**
   * Valida que un ID tenga el formato correcto
   * @param id - ID a validar
   * @param prefix - Prefijo opcional que debe tener el ID
   */
  protected validateId(id: ID, prefix?: string): void {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error('El ID debe ser una cadena no vacía');
    }

    if (prefix && !id.startsWith(prefix)) {
      throw new Error(`El ID debe comenzar con '${prefix}'`);
    }
  }
}
