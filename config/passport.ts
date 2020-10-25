import passport from 'passport';
import {VerifyFunction ,Strategy as LocaStrategy} from 'passport-local';
import userModel,{IUser} from '../service/users.service.db';
import {verifyPassword} from "../utils/hash";

const localAuthCallback : VerifyFunction = (userName: string, password :string, done  ) => {

    userModel.findOne({ userName }).then((user) => {
    if (user) {
        const isValid =  verifyPassword(password, user.hash, user.salt);
        if(isValid){
            done(null,user)
        }

    } else {
      done(null, false);
    }
  });
};

const strategy : LocaStrategy = new LocaStrategy(localAuthCallback);

passport.serializeUser((user :IUser , done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    userModel.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});

