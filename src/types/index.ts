// Common types
export type ID = string;

export type Nullable<T> = T | undefined | null;

/**
 * Tipos de logística disponibles para los envíos
 */
export enum LogisticType {
  /** Envío con entrega en punto de conveniencia */
  XD_DROP_OFF = 'XD_DROP_OFF',
  /** Envío directo del vendedor al comprador */
  CROSS_DOCKING = 'CROSS_DOCKING',
  /** Envío gestionado por Mercado Envíos Full */
  FULFILLMENT = 'FULFILLMENT',
  /** Envío con retiro en sucursal */
  DROP_OFF = 'DROP_OFF',
  /** Envío con Mercado Envíos */
  ME2 = 'ME2',
}

export interface PaginationOptions {
  first?: number;
  after?: string;
  before?: string;
  last?: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

// Product related types
export interface InstallmentInfo {
  quantity: number;
  amount: number;
  rate?: number;
  total: number;
}

export interface PriceInfo {
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  /** Moneda (por ejemplo: ARS, USD) */
  currency: string;
  installments?: InstallmentInfo;
}

export enum SellerCategory {
  STANDARD = 'STANDARD',
  MERCADOLIDER = 'MERCADOLIDER',
  MERCADOLIDER_GOLD = 'MERCADOLIDER_GOLD',
  MERCADOLIDER_PLATINUM = 'MERCADOLIDER_PLATINUM',
}

export interface Seller {
  id: ID;
  name: string;
  category?: SellerCategory;
  sales: number;
  followers: number;
  products: number;
  /** Porcentaje 0-100 */
  reputation: number;
  url: string;
}

export interface Category {
  id: ID;
  name: string;
  path: Array<Category>;
}

export interface ShippingInfo {
  /** Indica si el envío es gratuito */
  freeShipping: boolean;
  /** Fecha estimada de entrega */
  estimatedDelivery?: string;
  /** Indica si está disponible para retiro */
  pickupAvailable?: boolean;
  /** Ubicación de retiro */
  pickupLocation?: string;
  /** Tipo de logística */
  logisticType?: LogisticType;
}

// Enums y tipos adicionales para alinear con el esquema GraphQL
export enum ProductCondition {
  NEW = 'NEW',
  USED = 'USED',
  REFURBISHED = 'REFURBISHED',
}

export interface Installment {
  quantity: number;
  amount: number;
  rate?: number;
  total: number;
}

export interface PaymentMethod {
  id: ID;
  name: string;
  installments: Installment[];
}

export interface Product {
  id: ID;
  title: string;
  description?: string;
  condition: ProductCondition;
  category: Category;
  features: Array<{ name: string; value: string }>;
  images: string[];
  seller: Seller;
  shipping: ShippingInfo;
  priceInfo: PriceInfo;
  paymentMethods: PaymentMethod[];
  soldQuantity: number;
  availableQuantity: number;
  ratingSummary?: RatingSummary;
}

// Review related types
export interface Author {
  id: ID;
  name: string;
}

export interface Review {
  id: ID;
  product: Product;
  rating: number;
  title?: string;
  content?: string;
  date: Date;
  author: Author;
  verifiedPurchase: boolean;
  likes: number;
  dislikes: number;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  ratings: {
    oneStar: number;
    twoStars: number;
    threeStars: number;
    fourStars: number;
    fiveStars: number;
  };
}

// Question related types
export type QuestionStatus = 'ANSWERED' | 'UNANSWERED' | 'DELETED';

export interface Question {
  id: ID;
  product: Product;
  question: string;
  answer?: Answer;
  date: Date;
  author: Author;
  status: QuestionStatus;
  likes: number;
  dislikes: number;
}

export interface Answer {
  id: ID;
  content: string;
  date: Date;
  author: Author;
  likes: number;
  dislikes: number;
}
