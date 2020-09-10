import axios from 'axios';
import dotenv from 'dotenv';
import { insertToDB, IContentSchema } from '../monitor-data/data.service.db';
import apiConst from '../monitor-constants';

dotenv.config();

function buildCategoryHeadlineFromApi(category: string, article: IContentSchema, headlinesByCategory: Array<any>) {
  const dataElement = {
    title: article.title,
    url: article.url,
    urlToImage: article.urlToImage,
    publishedAt: article.publishedAt,
    resource: article.source.name,
  };
  headlinesByCategory.push(dataElement);
}

function handleHeadlinesFromApi(articles: Array<IContentSchema>, category: string) {
  const headlinesFromResource: Array<IContentSchema> = [];

  articles.map((article: IContentSchema) => buildCategoryHeadlineFromApi(category, article, headlinesFromResource));

  return {
    category,
    headlines: headlinesFromResource,
  };
}
async function getDataByCategory(category: string) {
  const query = `${apiConst.ISR_HEADLINES}&${apiConst.CATEGORY}=${category}`;
  const urlToGet = apiConst.BASE_API + query + apiConst.API_KEY;
  const res = await axios.get(urlToGet);
  const apiToSend = handleHeadlinesFromApi(res.data.articles, category);
  insertToDB(apiToSend);
}

function getDataFromAPI() {
  Object.values(apiConst.categories).forEach((category) => getDataByCategory(category));
}

export default getDataFromAPI;
