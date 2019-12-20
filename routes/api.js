const express = require('express');
const dbService = require('../monitor-data/data.service.db');
const router = express.Router();





router.get('/',async (req,res)=>{
 const data = await dbService.getNewsFromDB(req.query.resource);
 res.send(JSON.stringify(data));
});

module.exports.webAPIRouter = router;