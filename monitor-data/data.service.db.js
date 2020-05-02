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
                ResourceModel.updateOne({category: doc.category}, {$push: {headlines: headlinesFromCategory}}).then(() => {
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



module.exports.getNewsFromDB = async function getServerData(resource) {
    let datafromdB = ['non-initialized'];
   await ResourceModel.aggregate
   ([{$match:{resourceName:new RegExp('.+' + resource + '.+')}},{$unwind:'$headlines'},{$sort:{'headlines.publishedAt':-1}},
       {$group:{_id:'$resourceName',title:{$first:'$headlines.title'},publishedAt:{$first:'$headlines.publishedAt'},
           urlToImage:{$first:'$headlines.urlToImage'}}}]).
    then(data=>datafromdB=data)
        .catch(err => console.log(err));

    return datafromdB;
};

