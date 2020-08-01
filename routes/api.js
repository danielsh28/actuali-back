 const express = require('express');
const dbService = require('../monitor-data/data.service.db');
const router = express.Router();





router.get('/choose-category',async (req,res)=>{
 const data = await dbService.getServerData(dbService.getCategoriesFromDB);
 res.send(JSON.stringify(data));
});

 router.get('/user-dashboard',async (req,res)=>{
   const data = await dbService.getServerData(dbService.getNewsFromDB,req.query.cat);
  res.send(JSON.stringify(data));
 });

module.exports.webAPIRouter = router;