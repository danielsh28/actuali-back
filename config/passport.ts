import passport from 'passport';
import LocalStrategy, {VerifyFunction} from 'passport-local';
import User from '../service/users.servive.db';

const localAuthCallback : VerifyFunction = (userName: string, password :string, done  ) => {

    User.findOne({ userName }).then((user) => {
    if (user) {
        const isValid = validPassword(password, user.hash, user.salt);
        if(isValid){
            done(null,user)
        }

    } else {
      done(null, false);
    }
  });
};
