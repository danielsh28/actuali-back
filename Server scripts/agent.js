module.exports.fetchHeadlines =   function(){
const apiConst = require('./api-constants');
const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const dbUrl = argv.type === 'prod' ?'https://server-mon.herokuapp.com/data/':'http://localhost:3000/newsapi/data' ;
const contentType= argv.type==null?apiConst.ISR_HEADLINES :argv.type;
    const urlToGet = apiConst.BASE_API + contentType + apiConst.API_KEY;
    const errFunc = err=>console.log(' error fetching from : '+ urlToGet + ": " +err.message);
    axios.get(urlToGet).then(async res => {
            /*axios.post(dbUrl,res.data.articles).catch(errFunc);*/
        console.log('status: ' + res.data.status);
        axios.post(dbUrl,
            handleHeadlinesFromApi(res.data.articles)).catch(err=>console.log(err.message));
        }
    ).catch(errFunc);
};
//function create  array of resource and headline tuples
function handleHeadlinesFromApi(articles){
    const headlinesByResource = new Array(0);
    articles.filter(article=>article.source.name === 'Ynet').forEach(article=>headlinesByResource.push({
        resourceName:article.source.name,
        title:article.title,
        publishedAt:article.publishedAt
    }));
    return headlinesByResource;
}


module.exports.fetchHeadlines();
/*setInterval(fetchHeadLines,2000);*/


