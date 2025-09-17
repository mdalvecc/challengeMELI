import { ID, Seller } from '@app-types/index.js';
import BaseService from './BaseService.js';

/**
 * Servicio para manejar la lógica de negocio de vendedores
 */
class SellerService extends BaseService<{ sellers: Seller[] }> {
  constructor() {
    super('sellers.json');
  }

  /**
   * Obtiene un vendedor por su ID
   * @param id - ID del vendedor
   * @returns Vendedor encontrado
   */
  public getSellerById(id: ID): Seller {
    this.validateId(id);
    return this.findById<Seller>(id, 'sellers');
  }

  /**
   * Obtiene todos los vendedores
   * @returns Array de vendedores
   */
  public getAllSellers(): Seller[] {
    return this.data?.sellers || [];
  }

  /**
   * Calcula un puntaje para un vendedor basado en su reputación
   * @param seller - Vendedor a evaluar
   * @returns Puntaje del vendedor (0-5)
   */
  public calculateSellerScore(seller: Seller): number {
    // La reputación viene como porcentaje 0-100.
    return Math.min(100, Math.max(0, seller.reputation));
  }
}

// Exportar una instancia del servicio
const sellerService = new SellerService();
export default sellerService;
