import express from 'express';
import {verifyPassword,hashPassword} from "../utils/hash";
import UserModel, {IUserHashedDetails} from "../service/users.service.db";



const authRouter = express.Router();


authRouter.post('/signup',(req,res)=>{

        const hashedPwd : IUserHashedDetails = hashPassword(req.body.password);
    UserModel.create({
         username: req.body.username,
        ...hashedPwd
    },(err) => {
        if (err){
            console.log(err);
            return;
        }
        console.log(`new user saved to db`);
        res.send('user has been saved to db');
    });

});

export default  authRouter;