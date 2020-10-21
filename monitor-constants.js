import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === 'dev' || process.env.TS_NODE_DEV ? '../.env.local' : '../.env',
  ),
});

export default {
  BASE_API: 'https://newsapi.org/v2/top-headlines',
  CATEGORY: 'category',
  categories: {
    BUSSINES: 'business',
    ENTERTAINMENT: 'entertainment',
    GENERAL: 'general',
    HEALTH: 'health',
    SCIENCE: 'science',
    SPORT: 'sport',
    TECHNOLOGY: 'technology',
  },
  ISR_HEADLINES: '?country=il',
  DB_URL: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@appcluster-ztphv.mongodb.net/headlines?retryWrites=true&w=majority`,
  API_KEY: process.env.API_KEY,
};
