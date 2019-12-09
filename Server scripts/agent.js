module.exports.fetchHeadlines = async function(){
    const apiConst = require('../monitor-constants.js');
    const axios = require('axios');
    const argv = require('minimist')(process.argv.slice(2));
    const dbUrl = argv.type === 'prod' ?'https://server-mon.herokuapp.com/data/':'http://localhost:3000/newsapi/data' ;
    const contentType= argv.type==null?apiConst.ISR_HEADLINES :argv.type;
    const urlToGet = apiConst.BASE_API + contentType + apiConst.API_KEY;
    const errFunc = err=>console.log(' error fetching from : '+ urlToGet + ": " +err.message);
    await axios.get(urlToGet).then( async res => {
            /*axios.post(dbUrl,res.data.articles).catch(errFunc);*/
            console.log('status: ' + res.data.status);
            const apiToSend = await handleHeadlinesFromApi(res.data.articles);
            axios.post(dbUrl, apiToSend);
        }
    ).catch(errFunc);
};
//function create  array of resource and headline tuples
function handleHeadlinesFromApi(articles){
    const headlinesFromResource = new Map();
    articles.map(article=>buildResourceHeadlineFromApi(article,headlinesFromResource));

    return strMapToObj(headlinesFromResource);
}

function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}
module.exports.fetchHeadlines();
/*setInterval(fetchHeadLines,2000);*/

function buildResourceHeadlineFromApi(article,headlinesFromResource){
    const dataElement = {
        title:article.title,
        url:article.url,
        urlToImage:article.urlToImage,
        publishedAt:article.publishedAt
    };
    const resourceNameKey = article.source.name;
    if(headlinesFromResource.get(resourceNameKey)){
        headlinesFromResource.get(resourceNameKey).push(dataElement);
    }
    else{
        const newResourceHeadlines = [];
        newResourceHeadlines.push(dataElement);
        headlinesFromResource.set(resourceNameKey,newResourceHeadlines);
    }
}


