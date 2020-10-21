#!/usr/bin/env node

/**
 * Module dependencies.
 */

import debug from 'debug';
import http from 'http';
import mongoose from 'mongoose';
import cron from 'cron';
import appConst from '../monitor-constants';
import app from '../app';
import fetchNewsData from '../server-scripts/agent';
import ErrnoException = NodeJS.ErrnoException;

const { connection } = mongoose;
mongoose
  .connect(appConst.DB_URL, { useNewUrlParser: true })
  .catch((err) => console.log(`connection failed : ${err.message}`));
connection.on('Error', () => console.log('Error connect to database'));
connection.once('open', () => {
  console.log('Connection established successfully');

  function normalizePort(val: string) {
    const port = parseInt(val, 10);

    if (Number.isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }

  /**
   * Normalize a port into a number, string, or false.
   */
  const port = normalizePort(process.env.PORT || '3001');

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error: ErrnoException) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Get port from environment and store in Express.
   */

  app.set('port', port);
  console.log(`dev mode:${process.env.TS_NODE_DEV}`);

  fetchNewsData();

  const job = new cron.CronJob('0 * 0 * * *', fetchNewsData);
  job.start();

  /**
   * Create HTTP server.
   */
  const server: http.Server = http.createServer(app);
  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', onError);

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    debug('server-monitor:server')(`Listening on ${bind}`);
  }

  server.on('listening', onListening);
});
