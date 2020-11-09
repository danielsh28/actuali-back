import passport from 'passport';
import { VerifyFunction, Strategy as LocaStrategy } from 'passport-local';
import userModel, { IUser } from '../service/users.service.db';
import { verifyPassword } from '../utils/hash';

const localAuthCallback: VerifyFunction = (userName: string, password: string, done) => {
  userModel.findOne({ username: userName }).then((user) => {
    if (user) {
      const isValid = verifyPassword(password, user.salt, user.hash);
      if (isValid) {
        done(null, user);
      }
    } else {
      done(null, false);
    }
  });
};

const localStrategy: LocaStrategy = new LocaStrategy(localAuthCallback);

passport.serializeUser((user: IUser, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  userModel
    .findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => done(err));
});

passport.use(localStrategy);

export default passport;
