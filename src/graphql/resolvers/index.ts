import { DateTimeResolver } from 'graphql-scalars';
import Product from './product.js';
import ProductPreview from './productPreview.js';
import Query from './query.js';
import Question from './question.js';
import Review from './review.js';

const resolvers = {
  Date: DateTimeResolver,
  Query,
  Product,
  ProductPreview,
  Review,
  Question,
};

export default resolvers;
