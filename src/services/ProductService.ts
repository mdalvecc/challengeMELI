import { Connection, ID, PaginationOptions, Product } from '@app-types/index.js';
import BaseService from './BaseService.js';
import sellerService from './SellerService.js';

/**
 * Servicio para manejar la lógica de negocio de productos
 */
class ProductService extends BaseService<{ products: Product[] }> {
  constructor() {
    super('products.json');
  }

  /**
   * Obtiene un producto por su ID
   * @param id - ID del producto
   * @returns Producto encontrado
   */
  public getProductById(id: ID): Product {
    this.validateId(id);
    return this.findById<Product>(id, 'products');
  }

  /**
   * Obtiene productos del mismo vendedor
   * @param id - ID del producto de referencia
   * @param pagination - Opciones de paginación
   * @returns Conexión con los productos del mismo vendedor
   */
  public getSameSellerProducts(
    id: ID,
    pagination: PaginationOptions = { first: 10 },
  ): Connection<Product> {
    this.validateId(id);

    const product = this.getProductById(id);
    const products = this.data?.products || [];
    const sameSellerProducts = products.filter(
      p => p.seller.id === product.seller.id && p.id !== id,
    );

    return this.createConnection<Product>(sameSellerProducts, pagination);
  }

  /**
   * Obtiene productos relacionados
   * @param id - ID del producto de referencia
   * @param pagination - Opciones de paginación
   * @returns Conexión con los productos relacionados
   */
  public getRelatedProducts(
    id: ID,
    pagination: PaginationOptions = { first: 10 },
  ): Connection<Product> {
    this.validateId(id);

    const product = this.getProductById(id);
    const products = this.data?.products || [];

    // En un caso real, esto usaría un algoritmo de recomendación
    // Por ahora, devolvemos productos de la misma categoría
    const relatedProducts = products
      .filter(p => p.category.id === product.category.id && p.id !== id)
      .sort((a, b) => b.soldQuantity - a.soldQuantity);

    return this.createConnection<Product>(relatedProducts, pagination);
  }

  /**
   * Obtiene productos frecuentemente comprados juntos
   * @param id - ID del producto de referencia
   * @param pagination - Opciones de paginación
   * @returns Conexión con los productos frecuentemente comprados juntos
   */
  public getFrequentlyBoughtTogether(
    id: ID,
    pagination: PaginationOptions = { first: 5 },
  ): Connection<Product> {
    this.validateId(id);

    const product = this.getProductById(id);
    const products = this.data?.products || [];

    // En un caso real, esto usaría datos históricos de compras
    // Por ahora, devolvemos productos de la misma categoría con mejor reputación
    const frequentlyBoughtTogether = products
      .filter(
        p =>
          p.category.id === product.category.id && p.id !== id && p.seller.id !== product.seller.id,
      )
      .sort((a, b) => this.calculateProductScore(b) - this.calculateProductScore(a));

    return this.createConnection<Product>(frequentlyBoughtTogether, pagination);
  }

  /**
   * Obtiene todos los productos con paginación
   * @param pagination - Opciones de paginación
   * @returns Conexión con los productos
   */
  public getAllProducts(pagination: PaginationOptions = { first: 10 }): Connection<Product> {
    const products = this.data?.products || [];
    return this.createConnection<Product>(products, pagination);
  }

  /**
   * Calcula un puntaje para un producto basado en su reputación
   * @private
   */
  private calculateProductScore(product: Product): number {
    // Puntaje basado en la reputación del vendedor y las ventas
    const sellerScore = (sellerService.calculateSellerScore(product.seller) / 100) * 5; // Convertir a escala 0-5
    const salesScore = Math.min(product.soldQuantity / 100, 5); // Máximo 5 puntos por ventas. Sólo como ejemplo.

    return sellerScore * 0.7 + salesScore * 0.3;
  }
}

// Exportar una instancia del servicio
const productService = new ProductService();
export default productService;
