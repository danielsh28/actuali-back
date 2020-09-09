import { insertToDB} from "../monitor-data/data.service.db.ts";
import  express from 'express';

const router = express.Router();
router.post('/',(req,res)=>{
insertToDB( req.body
).then(data=>res.send(data));
});

export default  router;
