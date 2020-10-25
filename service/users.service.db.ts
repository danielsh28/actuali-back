import mongoose, {Document, Schema} from 'mongoose';
export interface IUserHashedDetails {
    hash: string,
    salt: string,
}
export interface IUser extends IUserHashedDetails,Document{
    username: string,
    admin?: boolean,
}
const UserSchema  = new mongoose.Schema({
  username: {type:String,required:true,unique:true},
  hash: {type:String,required:true,unique:true},
  salt: {type:String,required:true,unique:false},
  admin: {type: Boolean, required: false,unique:false},
});

const userModel  = mongoose.model<IUser>('User', UserSchema);

export default userModel;
