import type {
  Answer,
  Nullable,
  ProductPreview,
  Question as QuestionType,
} from '@app-types/index.js';
import { getLogger } from '@app/lib/logger.js';
import { InternalError, NotFoundError } from '@graphql/errors/errors.js';
import type { Context, Resolvers } from '@graphql/types/resolvers.js';
import productService from '@services/ProductService.js';

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
  product: async (
    question: QuestionType,
    _args: unknown,
    context: Context,
  ): Promise<ProductPreview> => {
    try {
      if (question.product) {
        const p = question.product;
        const full = context.productLoader
          ? await context.productLoader.load(p.id)
          : productService.getProductById(p.id);
        const merged: ProductPreview = {
          id: full.id,
          title: p.title ?? full.title,
          images: full.images,
          category: full.category,
          seller: full.seller,
          priceInfo: full.priceInfo,
          paymentMethods: full.paymentMethods,
        };
        Object.assign(p, merged);
        return merged;
      }
      throw new NotFoundError('La pregunta no contiene el producto resuelto');
    } catch (error) {
      getLogger(context).error(
        { err: error, questionId: question.id, productId: question.product?.id },
        'Error al obtener el producto de la pregunta',
      );
      throw new InternalError('No se pudo obtener el producto de la pregunta');
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
