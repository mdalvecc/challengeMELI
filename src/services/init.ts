import categoryService from '@services/CategoryService.js';
import productService from '@services/ProductService.js';
import questionService from '@services/QuestionService.js';
import reviewService from '@services/ReviewService.js';
import sellerService from '@services/SellerService.js';

export async function initializeServices(): Promise<void> {
  try {
    console.log('Inicializando servicios...');

    await Promise.all([
      productService.initialize(),
      reviewService.initialize(),
      questionService.initialize(),
      sellerService.initialize(),
      categoryService.initialize(),
    ]);

    console.log('Todos los servicios inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar los servicios');
    throw error;
  }
}
