import { Connection, ID, PaginationOptions, Question } from '@app-types/index.js';
import BaseService from './BaseService.js';
import productService from './ProductService.js';

/**
 * Servicio para manejar la lógica de negocio de preguntas y respuestas
 */
class QuestionService extends BaseService<{ questions: Question[] }> {
  constructor() {
    super('questions.json');
  }

  /**
   * Obtiene las preguntas de un producto
   * @param id - ID del producto
   * @param pagination - Opciones de paginación
   * @returns Conexión con las preguntas
   */
  public getProductQuestions(
    id: ID,
    pagination: PaginationOptions = { first: 10 },
  ): Connection<Question> {
    this.validateId(id);

    // Verificar que el producto existe
    productService.getProductById(id);

    let questions = this.data?.questions || [];
    questions = questions.filter((q: Question) => q.product.id === id);

    // Ordenar por fecha (más recientes primero)
    questions.sort(
      (a: Question, b: Question) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return this.createConnection<Question>(questions, pagination);
  }
}

// Exportar una instancia del servicio
const questionService = new QuestionService();
export default questionService;
