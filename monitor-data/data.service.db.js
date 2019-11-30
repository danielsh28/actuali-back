const mongoose = require('mongoose');
const assert  = require('assert');
const appConstants = require('../monitor-constants');
const db = mongoose.connection;
let session =null;
db.startSession().then(_session=>{
    session = _session;
});

const contentSchema= new mongoose.Schema({
    time:Date,
    content:String,
});
const  resourceSchema = new mongoose.Schema({
    resourceName: String,
    headlines:[contentSchema]
});
resourceSchema.methods.conformSave = (log)=> console.log(log);
const resource = mongoose.model('Resource', resourceSchema);
module.exports.inserTtoDB = async function insertToDB(dataFromServer) {
dataFromServer.forEach(headline=>handleHeadlinesByResource(headline));
}
//function update exist resource document in a new content or creating a new one with a new resource
 async function handleHeadlinesByResource(headline){
       let retVal = null ;
       resource.findOne({resourceName:headline.resourceName}).session(session).then( async (doc)=>{
        const contentData = {time:headline.publishedAt,
           content:headline.title};
        if(doc!=null){
            await resource.updateOne({resourceName:doc[0].resourceName},{$push:{headlines: contentData}}.session(session)).then(()=>{
                resource.conformSave('resource ' + doc[0].resourceName +' updated');
            });
        }
        else{
            await session.startTransaction();
            await resource.create([{resourceName: headline.resourceName,headlines:[contentData]}],{session:session})
            session.commitTransaction();
            ;
        }
   });
};

module.exports.connectToDB = function conncetToDB(){
    mongoose.connect('mongodb://localhost:27017/headlines',{useNewURLParser:true});
    db.on('Error',()=> console.log('Error connect to database'));
    db.once('open',()=>console.log('Connection established successfully'));
}


module.exports.emitFromDB = function getServerData(socket){
    Server.aggregate([{$unwind:'$data'},{$sort:{'data.time':-1}}, {
        $group: {
            _id: "$name",
            cpuUsage: {$first: "$data.cpuUsage"},
            availableMem: {$first: "$data.availableMem"}, time: {$first: "$data.time"}}},{
        $project: {name:'$_id',cpuUsage:"$cpuUsage",availableMem:"$availableMem",time:"$time"}
    }]).then(
                (res) => {
                    //Server.find({$match:time:})
                    socket.emit('getData', res);
                }
            ).catch(err => console.log(err));
};

