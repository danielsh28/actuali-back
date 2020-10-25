import crypto from 'crypto';
import {IUserHashedDetails} from "../service/users.service.db";

const HASH_FUNC = 'sha256';

export const hashPassword = (password :string) : IUserHashedDetails => {
 const salt = crypto.randomBytes(16).toString('hex');
 const hash = crypto.pbkdf2Sync(password,salt,10000,64,HASH_FUNC).toString('hex');

 return {
     hash,
     salt
    }
}

export const verifyPassword = (password :string, salt: string, hash : string) :boolean => {
    const hashFromInput = crypto.pbkdf2Sync(password,salt,10000,64,HASH_FUNC).toString('hex');
    return hashFromInput === hash;
}