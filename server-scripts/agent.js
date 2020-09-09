require('dotenv').config();
const dataService = require('data.service.db.ts');
const apiConst = require('../monitor-constants.js');
const axios = require('axios');

function getDataFromAPI() {
  /*  process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`[${new Date().toString()}]`);
    console.log(`fetching news... `);*/
    Object.values(apiConst.categories).forEach(category=> getDataByCategory(category));
};

async function getDataByCategory(category) {
    const query =`${apiConst.ISR_HEADLINES}&${apiConst.CATEGORY}=${category}`;
    const urlToGet = apiConst.BASE_API + query + apiConst.API_KEY ;
    const res = await axios.get(urlToGet);
    const apiToSend = handleHeadlinesFromApi(res.data.articles,category);
    dataService.inserTtoDB(apiToSend);
}

//function create  array of resource and headline tuples
function handleHeadlinesFromApi(articles,category) {
    const headlinesFromResource = [];
    articles.map(article => buildCategoryHeadlineFromApi(category, article, headlinesFromResource));

    return {
        category,
        headlines:headlinesFromResource
    }
}

function buildCategoryHeadlineFromApi(category,article, headlinesByCategory) {
    const dataElement = {
        title: article.title,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        resource: article.source.name
    }
    headlinesByCategory.push(dataElement);
}

export default getDataFromAPI;


