import { logger } from '@app/lib/logger.js';
import categoryService from './CategoryService.js';
import productService from './ProductService.js';
import questionService from './QuestionService.js';
import reviewService from './ReviewService.js';
import sellerService from './SellerService.js';

export async function initializeServices(): Promise<void> {
  try {
    logger.info('Inicializando servicios...');

    await Promise.all([
      productService.initialize(),
      reviewService.initialize(),
      questionService.initialize(),
      sellerService.initialize(),
      categoryService.initialize(),
    ]);

    logger.info('Todos los servicios inicializados correctamente');
  } catch (error) {
    logger.error({ err: error }, 'Error al inicializar los servicios');
    throw error;
  }
}
