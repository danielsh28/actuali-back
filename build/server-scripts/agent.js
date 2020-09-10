"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const data_service_db_1 = require("../monitor-data/data.service.db");
const monitor_constants_js_1 = __importDefault(require("../monitor-constants.js"));
const axios_1 = __importDefault(require("axios"));
function getDataFromAPI() {
    Object.values(monitor_constants_js_1.default.categories).forEach(category => getDataByCategory(category));
}
;
async function getDataByCategory(category) {
    const query = `${monitor_constants_js_1.default.ISR_HEADLINES}&${monitor_constants_js_1.default.CATEGORY}=${category}`;
    const urlToGet = monitor_constants_js_1.default.BASE_API + query + monitor_constants_js_1.default.API_KEY;
    const res = await axios_1.default.get(urlToGet);
    const apiToSend = handleHeadlinesFromApi(res.data.articles, category);
    data_service_db_1.insertToDB(apiToSend);
}
//function create  array of resource and headline tuples
function handleHeadlinesFromApi(articles, category) {
    const headlinesFromResource = [];
    articles.map((article) => buildCategoryHeadlineFromApi(category, article, headlinesFromResource));
    return {
        category,
        headlines: headlinesFromResource
    };
}
//@ts-ignore
function buildCategoryHeadlineFromApi(category, article, headlinesByCategory) {
    const dataElement = {
        title: article.title,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        resource: article.source.name
    };
    headlinesByCategory.push(dataElement);
}
exports.default = getDataFromAPI;
//# sourceMappingURL=agent.js.map