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
const ResourceModel = mongoose.model('Resource', resourceSchema);

module.exports.inserTtoDB = function insertToDB(dataFromServer) {
         handleHeadlinesByResource(dataFromServer);
};


//function update exist resource document in a new content or creating a new one with a new resource
      function handleHeadlinesByResource(headlinesByCategory) {
        const categoryElement = headlinesByCategory.category;
        const headlinesFromCategory = headlinesByCategory.headlines;
         ResourceModel.findOne({category: categoryElement}, function (doc) {
            if (doc != null) {
                ResourceModel.updateOne({category: doc.category}, {addToSet: {headlines:{$each:headlinesFromCategory} }}).then(() => {
                    ResourceModel.conformSave('category ' + doc[0].category + ' updated');
                });
            } else {
                ResourceModel.create({category: categoryElement, headlines: headlinesFromCategory}).then(()=>{
                    resourceSchema.methods.conformSave('category ' + categoryElement + ' created');
                });
                ;
            }
        }).catch(error => console.log(error));
    }

module.exports.getCategoryFromDB = async function (){
          let catagoriesFromDB = [];
          try{
              catagoriesFromDB = await ResourceModel.aggregate({$unwind: "$headlines"},
              {$sort : {"headlines.publishedAt":-1}},{$group: { _id: "$category",urlToImage:{$first: "$headlines.urlToImage"}}})
          }
          catch (err) {
              console.log(err);

          }
            return cata
}
const getCatagoriesFromDB = ()=>{
          return ResourceModel.aggregate({$unwind: "$headlines"}, {$sort : {"headlines.publishedAt":-1}},
              {$group: { _id: "$category",urlToImage:{$first: "$headlines.urlToImage"}}});
}

const getNewsFromDB = ()=>{
          return ResourceModel.aggregate([{$match: {category:'sport'}},{$unwind: '$headlines'},
              {$sort : {'headlines.publishedAt' : -1}},{$project : {'_id':0, "headlines": 1}}])
}
module.exports.getServerData = async function getServerData(queryCallback) {
    let datafromdB = ['non-initialized'];
   try{
         datafromdB = await queryCallback();
   }
   catch (err) {
       console.log(err)
   }

    return datafromdB.map(element=>({
        title: element.headlines.title,
        url: element.headlines.url,
        urlToImage: element.headlines.urlToImage,
        publishedAt : element.headlines.publishedAt,
        resource : element.headlines.resource
    }));
};

