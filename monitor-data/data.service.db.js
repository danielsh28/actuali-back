const mongoose = require('mongoose');
const assert  = require('assert');
const db = mongoose.connection;
const ServerSchema = new mongoose.Schema({
    name:String,
    cpuUsage:Number,
    availableMem:Number,
    time:String
});
ServerSchema.methods.conformSave = ()=> console.log('server data successfully saved');

const Server = mongoose.model('Server',ServerSchema);



module.exports.inserTtoDB = async function insertToDB(data) {
    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const newServerDoc = new Server({name: data.name.hostname, cpuUsage:data.cpuData,availableMem:data.availableMem, time:time });
    newServerDoc.save((err,newServerDoc)=>{
        assert.strictEqual(null,err);
        newServerDoc.conformSave();
    });
}

module.exports.connectToDB = function conncetToDB(){
    mongoose.connect('mongodb://localhost/serverDB',{useNewURLParser:true});
    db.on('Error',()=> console.log('Error connect to database'));
    db.once('open',()=>console.log('Connection established successfully'));
}


module.exports.emitFromDB =   function   getServerData(socket){
    let dataToSend = '';
      Server.findOne({},{},{sort:{_id:-1}},(err,data)=>{
        assert.strictEqual(null,err);
          socket.emit('getData',[data]);
      });

}

