import mongoose, {Document, Schema} from 'mongoose';
import {google} from "google-gax/protos/iam_service";
import type = google.type;
import {booleanLiteral} from "@babel/types";

interface IUserSchema extends  Document{
    username: string,
    hash: string,
    salt: string,
    admin: boolean,
}
const UserSchema  = new mongoose.Schema({
  username: {type:String,required:true,unique:true},
  hash: {type:String,required:true,unique:true},
  salt: {type:String,required:true,unique:false},
  admin: {type: Boolean, required: false,unique:false},
});

const userModel  = mongoose.model<IUserSchema>('User', UserSchema);

export default userModel;
