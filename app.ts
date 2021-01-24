import createError from 'http-errors';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import passportAuth from './config/passport';
import connectMongo from 'connect-mongo';
import usersRouter from './routes/users';
import indexRouter from './routes';
import dataRouter from './routes/data';
import webAPIRouter from './routes/api';
import authRouter from './routes/auth';
import { connection } from './service/data.service.db';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const SessionStore = connectMongo(session);
app.use(
  session({
    name: 'actuali_sessid',
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: new SessionStore({
      mongooseConnection: connection,
      collection: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  }),
);
app.set('view engine', 'jade');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(passportAuth.initialize());
app.use(passportAuth.session());
app.use(cors({ credentials: true, origin: '*' }));
app.use(cookieParser());
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/newsapi/data', dataRouter);
app.use('/api/', webAPIRouter);
app.use('/auth/', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('<h> page not found</h>');
});

export default app;
