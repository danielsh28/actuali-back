const mongoose = require('mongoose');
const appConst = require('../monitor-constants');
mongoose.connect(appConst.DB_URL, {useNewURLParser: true}).catch(
    err=> console.log('connection failed : ' + err.message));
    const db = mongoose.connection;
    db.on('Error', () => console.log('Error connect to database'));
    db.once('open', () => console.log('Connection established successfully'));

const contentSchema = new mongoose.Schema({
    publishedAt: Date,
    title: String,
    url:String,
    urlToImage:String,
    resource:String
});
const resourceSchema = new mongoose.Schema({
    category: String,
    headlines: [contentSchema]
});
resourceSchema.methods.conformSave = (log) => console.log(log);
const ResourceModel = mongoose.model('resource', resourceSchema);





//function update exist resource document in a new content or creating a new one with a new resource
module.exports.inserTtoDB =  function handleHeadlinesByResource(headlinesByCategory) {
        const categoryElement = headlinesByCategory.category;
        const headlinesFromCategory = headlinesByCategory.headlines;
         ResourceModel.findOne({category: categoryElement}, function (err,doc) {
            if (doc != null) {
                ResourceModel.updateOne({category: doc.category}, {addToSet: {headlines:{$each:headlinesFromCategory} }}).then(() => {
                    resourceSchema.methods.conformSave('category ' + doc.category + ' updated');
                });
            } else {
                ResourceModel.create({category: categoryElement, headlines: headlinesFromCategory}).then(()=>{
                    resourceSchema.methods.conformSave('category ' + categoryElement + ' created');
                });
                ;
            }
        }).catch(error => console.log(error));
    }


module.exports.getCategoriesFromDB =  function (params){
          return ResourceModel.aggregate([{$unwind: "$headlines"}, {$sort : {"headlines.publishedAt":-1}},
              {$group: { _id: "$category",urlToImage:{$first: "$headlines.urlToImage"}}}]).then(
              categories => categories.map(cat => ({
                      catName:cat._id,
                      urlToImage : cat.urlToImage
                  })
              )
          );
}

module.exports.getNewsFromDB = function  (categories){
          return ResourceModel.aggregate([{$match:{category:{$in:categories}}},{$unwind: '$headlines'},
              {$sort : {'headlines.publishedAt' : -1}},{$project : {'_id':0, "headlines": 1}}]).then(newsList=>
              newsList.map(element=>({
        title: element.headlines.title,
        url: element.headlines.url,
        urlToImage: element.headlines.urlToImage,
        publishedAt : element.headlines.publishedAt,
        resource : element.headlines.resource}))
          );
}
module.exports.getServerData = async function getServerData(queryCallback,params) {
    let datafromdB = ['non-initialized'];
    try {
        datafromdB = await queryCallback(params);
    } catch (err) {
        console.log(err)
    }

    return datafromdB;


}