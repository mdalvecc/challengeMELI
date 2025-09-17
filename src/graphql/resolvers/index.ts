import { DateTimeResolver } from 'graphql-scalars';
import Product from './product.js';
import Query from './query.js';
import Question from './question.js';
import Review from './review.js';

const resolvers = {
  Date: DateTimeResolver,
  Query,
  Product,
  Review,
  Question,
};

export default resolvers;
