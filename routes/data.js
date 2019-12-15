const express = require('express');
const router = express.Router();
const dbService = require('../monitor-data/data.service.db');


router.post('/',(req,res)=>{
dbService.inserTtoDB( req.body
).then(data=>res.send(data));
});

module.exports.dataRouter = router;
