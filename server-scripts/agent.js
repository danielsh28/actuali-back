require('dotenv').config();
const dataService = require('../monitor-data/data.service.db');
const apiConst = require('../monitor-constants.js');
const axios = require('axios');
const errFunc = err => console.log(' error fetching from : ' + urlToGet + ": " + err.message);



module.exports.fetchNewsData = function getDataFromAPI() {
    console.log(`[${new Date().toString()}] fetching news... `);
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
/*setInterval(fetchHeadLines,2000);*/

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


