const mongoose = require('mongoose');
const assert  = require('assert');
const db = mongoose.connection;
const  DataSchema = new mongoose.Schema({
    cpuUsage:Number,
    availableMem:Number,
    time:Date
});
const ServerSchema = new mongoose.Schema({
    name: String,
    data: [DataSchema]
});
ServerSchema.methods.conformSave = (log)=> console.log(log);

const Server = mongoose.model('Server',ServerSchema);



module.exports.inserTtoDB = async function insertToDB(dataFromServer) {
    Server.find({name:dataFromServer.name.hostname},(err,doc)=>{
        const resourcesData = {cpuUsage:dataFromServer.cpuData,
            availableMem:dataFromServer.availableMem, time:dataFromServer.time};
        if(doc.length!==0){
            Server.update({name:doc[0].name},{$push:{data: resourcesData}},(err,data)=>{
                assert.strictEqual(null,err);
                console.log('server ' + doc[0].name + ' has been updated');
            });
           /* const docForUpdate = new Server(doc);
            docForUpdate.data.push(doc.data);
            docForUpdate.save((err,data)=>{
                assert.strictEqual(null,err);
                docForUpdate.conformSave('server ' + data.name + ' has been updated');
            });*/

        }
        else{
            const newServerDoc = new Server({name: dataFromServer.name.hostname,data:[resourcesData]});
            newServerDoc.save((err,newServerDoc)=>{
                assert.strictEqual(null,err);
                newServerDoc.conformSave('new server name: ' + newServerDoc.name + ' document has been saved');
            });
        }

    });

}

module.exports.connectToDB = function conncetToDB(){
    mongoose.connect('mongodb://localhost/serverDB',{useNewURLParser:true});
    db.on('Error',()=> console.log('Error connect to database'));
    db.once('open',()=>console.log('Connection established successfully'));
}


module.exports.emitFromDB = function getServerData(socket){
    Server.aggregate([{$unwind:'$data'},{$sort:{'data.time':-1}}, {
        $group: {
            _id: "$name",
            cpuUsage: {$first: "$data.cpuUsage"},
            availableMem: {$first: "$data.availableMem"}, time: {$first: "$data.time"}}}]).then(
                (res) => {
                    //Server.find({$match:time:})
                    socket.emit('getData', res);
                }
            ).catch(err => console.log(err));
};

