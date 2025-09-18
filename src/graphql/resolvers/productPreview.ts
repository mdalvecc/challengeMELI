import type { Resolvers } from '@graphql/types/resolvers.js';
import productService from '@services/ProductService.js';

// Field resolvers for ProductPreview to hydrate missing fields lazily
const ProductPreview: Resolvers['ProductPreview'] = {
  title(product) {
    if (product.title) return product.title;
    const full = productService.getProductById(product.id);
    Object.assign(product, full);
    return full.title;
  },
  images(product) {
    if (product.images) return product.images;
    const full = productService.getProductById(product.id);
    Object.assign(product, full);
    return full.images;
  },
  category(product) {
    if (product.category) return product.category;
    const full = productService.getProductById(product.id);
    Object.assign(product, full);
    return full.category;
  },
  seller(product) {
    if (product.seller) return product.seller;
    const full = productService.getProductById(product.id);
    Object.assign(product, full);
    return full.seller;
  },
  priceInfo(product) {
    if (product.priceInfo) return product.priceInfo;
    const full = productService.getProductById(product.id);
    Object.assign(product, full);
    return full.priceInfo;
  },
  paymentMethods(product) {
    if (product.paymentMethods) return product.paymentMethods;
    const full = productService.getProductById(product.id);
    Object.assign(product, full);
    return full.paymentMethods;
  },
};

export default ProductPreview;
