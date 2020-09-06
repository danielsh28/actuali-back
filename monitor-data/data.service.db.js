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
},{_id:false});
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
         ResourceModel.findOne({category: categoryElement}, async function (err,doc) {
            if (doc != null) {
               const updatedDoc = await  ResourceModel.findOneAndUpdate({category: doc.category}, {$addToSet: {headlines:{$each:headlinesFromCategory}}}
                ,{new: true,
                       useFindAndModify:false});
                console.log(`headlines from ${categoryElement} updated from ${doc.headlines.length} to ${updatedDoc.headlines.length}`);
            } else {
                ResourceModel.create({category: categoryElement, headlines: headlinesFromCategory}).then(()=>{
                    resourceSchema.methods.conformSave('category ' + categoryElement + ' created');
                });
                ;
            }
        }).catch(error => console.log(error));
    }


module.exports.getCategoriesFromDB =  function (){
          return ResourceModel.aggregate([{$unwind: "$headlines"}, {$sort : {"headlines.publishedAt":-1}},
              {$group: { _id: "$category",urlToImage:{$first: "$headlines.urlToImage"}}}]).then(
              categories => categories.map(cat => ({
                      catName:cat._id,
                      urlToImage : cat.urlToImage
                  })
              ).filter(cat => cat.catName!=='general')
          );
}

module.exports.getNewsFromDB = function  (params){
          return ResourceModel.aggregate([{$match:{category:{$in:params.cat}}},{$unwind: '$headlines'},
              {$group:{_id:"$headlines.url",cat:{$first:'category'}, title:{$first:'$headlines.title'},
                      urlToImage:{$first:"$headlines.urlToImage"},publishedAt:{$first:'$headlines.publishedAt'},resource:{$first:'$headlines.resource'}}}
              ,{$sort : {'publishedAt' : -1}},{$limit:parseInt(params.count)}]).then(newsList=>
              newsList.map(element=>({
        title: element.title,
        url: element._id,
        urlToImage: element.urlToImage,
        publishedAt : element.publishedAt,
        resource : element.resource}))
          );
}
module.exports.getServerData = async function getServerData(queryCallback,params) {
    let datafromdB = ['non-initialized'];
    try {
        datafromdB = await queryCallback(params);
    } catch (err) {
        console.log(err)
    }

    return [...new Set(datafromdB)];


}