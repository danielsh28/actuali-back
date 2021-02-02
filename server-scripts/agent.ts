import axios from 'axios';
import { insertToDB, IContentSchema } from '../service/data.service.db';
import apiConst from '../config/AppConstants.js';

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
  const urlToGet = `${apiConst.BASE_API}${query}&apikey=${apiConst.API_KEY}`;
  try {
    const res = await axios.get(urlToGet);
    const apiToSend = handleHeadlinesFromApi(res.data.articles, category);
    insertToDB(apiToSend);
  } catch (e) {
    console.log(e.response);
  }
}
function deleteOlHeadlines(){

}
function getDataFromAPI() {
  console.log(`fetch data in ${new Date().toLocaleTimeString()}`);
  Object.values(apiConst.categories).forEach((category) => getDataByCategory(category));
}

export default getDataFromAPI;
