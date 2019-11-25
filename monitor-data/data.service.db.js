const mongoose = require('mongoose');
const assert  = require('assert');
const appConstants = require('../monitor-constants');
const db = mongoose.connection;
const contentSchema= new mongoose.Schema({
    time:Date,
    content:String,
});
const  resourceSchema = new mongoose.Schema({
    resourceName: String,
    data:[contentSchema]
});
resourceSchema.methods.conformSave = (log)=> console.log(log);

const Headline = mongoose.model('Headline',ServerSchema);



module.exports.inserTtoDB = async function insertToDB(dataFromServer) {
    let retVal = {};
   await  Server.find({name:dataFromServer.name},(err,doc)=>{
        const resourcesData = {cpuUsage:dataFromServer.cpuData,
            availableMem:dataFromServer.availableMem, time:dataFromServer.time};
        if(doc.length!==0){
            Server.update({name:doc[0].name},{$push:{data: resourcesData}},(err,data)=>{
                assert.strictEqual(null,err);
                console.log('server ' + doc[0].name + ' has been updated');
                retVal = data;

            });
        }
        else{
            const newServerDoc = new Server({name: dataFromServer.name,data:[resourcesData]});
            newServerDoc.save((err,newServerDoc)=>{
                assert.strictEqual(null,err);
                newServerDoc.conformSave('new server name: ' + newServerDoc.name + ' document has been saved');
                retVal = newServerDoc;

            });
        }

   });

   return retVal;

};

module.exports.connectToDB = function conncetToDB(){
    mongoose.connect(appConstants.DB_URL,{useNewURLParser:true});
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

