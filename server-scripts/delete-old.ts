import mongoose, { Document } from 'mongoose';
import QueryString from 'qs';
import {ResourceModel} from '../service/data.service.db'



export function deleteOldHeadlines( ): void {
        const date  :Date = new Date(new Date().setMonth(new Date().getMonth() -1));
    ResourceModel.updateMany({},{ $pull:
            { headlines : { publishedAt:  { $lte: date}}}},(err,raw) => {
        if(err){
            console.log(err);
        }
        else{
            console.log(raw);
            console.log('deleted!!!!!' );
        }
    } );

}


