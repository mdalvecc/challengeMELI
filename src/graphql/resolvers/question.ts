import type { Answer, Nullable, Product, Question as QuestionType } from '@app-types/index.js';
import type { Resolvers } from '@graphql/types/resolvers.js';

const Question: Resolvers['Question'] = {
  /**
   * Resuelve el autor de una pregunta
   */
  author: (question: { author: { id: string; name: string } }) =>
    Promise.resolve({
      id: question.author.id,
      name: question.author.name,
    }),

  /**
   * Resuelve el producto de una pregunta
   */
  product: async (question: QuestionType): Promise<Product> => {
    try {
      if (question.product) return question.product;
      throw new Error('La pregunta no contiene el producto resuelto');
    } catch (error) {
      console.error('Error al obtener el producto de la pregunta:', error);
      throw new Error('No se pudo obtener el producto de la pregunta');
    }
  },

  /**
   * Resuelve las respuestas a una pregunta
   */
  answer: (question: QuestionType): Promise<Nullable<Answer>> => {
    return Promise.resolve(question.answer);
  },
};

export default Question;
