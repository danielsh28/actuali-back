import express, { NextFunction, Request, Response } from 'express';
import { hashPassword } from '../utils/hash';
import UserModel, { IUserHashedDetails } from '../service/users.service.db';
import passport from 'passport';

const authRouter = express.Router();

authRouter.post('/signup', (req, res) => {
  const hashedPwd: IUserHashedDetails = hashPassword(req.body.password);
  UserModel.create(
    {
      username: req.body.username,
      ...hashedPwd,
    },
    (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`new user saved to db`);
      res.send('user has been saved to db');
    },
  );
});

authRouter.post(
  '/login',
  passport.authenticate('local', { successRedirect: 'success-login', failureRedirect: 'failure-login' }),
);

authRouter.get('/success-login', (req, res) => {
  res.json({ isAuthSuccess: true });
});

authRouter.get('/failure -login', (req, res) => {
  res.json({ isAuthSuccess: false });
});

const isAuth = (req: Request, res: Response, next?: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else res.json({ userAuthenticated: false });
};
export default authRouter;
