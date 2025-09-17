import { Category, ID } from '@app-types/index.js';
import BaseService from './BaseService.js';

/**
 * Servicio para manejar la lógica de negocio de categorías
 */
class CategoryService extends BaseService<{ categories: Category[] }> {
  constructor() {
    super('categories.json');
  }

  /**
   * Obtiene una categoría por su ID
   * @param id - ID de la categoría
   * @returns Categoría encontrada
   */
  public getCategoryById(id: ID): Category {
    this.validateId(id);
    return this.findById<Category>(id, 'categories');
  }

  /**
   * Obtiene todas las categorías
   * @returns Array de categorías
   */
  public getAllCategories(): Category[] {
    return this.data?.categories || [];
  }

  /**
   * Obtiene categorías hijas de una categoría padre
   * @param parentId - ID de la categoría padre
   * @returns Array de categorías hijas
   */
  public getChildCategories(parentId: ID): Category[] {
    const categories = this.data?.categories || [];
    return categories.filter(
      category =>
        category.path.length > 1 && category.path[category.path.length - 2].id === parentId,
    );
  }

  /**
   * Obtiene la categoría raíz de una categoría
   * @param categoryId - ID de la categoría
   * @returns Categoría raíz
   */
  public getRootCategory(categoryId: ID): Category {
    const category = this.getCategoryById(categoryId);
    const rootId = category.path[0].id;
    return this.getCategoryById(rootId);
  }
}

// Exportar una instancia del servicio
const categoryService = new CategoryService();
export default categoryService;
