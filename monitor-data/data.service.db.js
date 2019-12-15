const mongoose = require('mongoose');
const assert = require('assert');
const appConstants = require('../monitor-constants');
const db = mongoose.connection;

const contentSchema = new mongoose.Schema({
    publishedAt: Date,
    title: String,
    url:String,
    urlToImage:String
});
const resourceSchema = new mongoose.Schema({
    resourceName: String,
    headlines: [contentSchema]
});
resourceSchema.methods.conformSave = (log) => console.log(log);
const ResourceModel = mongoose.model('Resource', resourceSchema);
module.exports.inserTtoDB = async function insertToDB(dataFromServer) {
    const resultArray = Object.entries(dataFromServer);
    for(let i in resultArray){
      await  handleHeadlinesByResource(resultArray[i])
    }
   //resultArray.forEach( function (resourceResult ){handleHeadlinesByResource(resourceResult)})
};


//function update exist resource document in a new content or creating a new one with a new resource
    async function handleHeadlinesByResource(resource) {
        const resourceName = resource[0];
        const headlinesFromResource = resource[1];
        await ResourceModel.findOne({resourceName: resourceName}, function (doc) {
            if (doc != null) {
                ResourceModel.updateOne({resourceName: doc.resourceName}, {$push: {headlines: headlinesFromResource}}.session(session)).then(() => {
                    ResourceModel.conformSave('resource ' + doc[0].resourceName + ' updated');
                });
            } else {
                ResourceModel.create({resourceName: resourceName, headlines: headlinesFromResource})
                ;
            }
        }).catch(error => console.log(error));
    }

module.exports.connectToDB = function connectToDB() {
    mongoose.connect(appConstants.DB_URL, {useNewURLParser: true}).catch(
        err=> console.log('connection failed : ' + err.message)
    );
    db.on('Error', () => console.log('Error connect to database'));
    db.once('open', () => console.log('Connection established successfully'));
};


module.exports.emitFromDB = function getServerData(socket) {
    ResourceModel.aggregate([{$match:{resourceName:'Walla.co.il'}},{$unwind:'$headlines'},
        {$project:{'_id':0}}]).then((data=>console.log((data)))).catch(err => console.log(err));
};

