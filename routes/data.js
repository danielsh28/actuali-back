const express = require('express');
const router = express.Router();
const util = require('../monitor-utilis');
const dbService = require('../monitor-data/data.service.db');




router.post('/',(req,res)=>{
dbService.inserTtoDB( req.body
).then(data=>res.send(data)).catch(err=>console.log(err));
});

module.exports.dataRouter = router;
