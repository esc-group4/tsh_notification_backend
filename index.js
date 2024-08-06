import express from 'express';
import cors from'cors';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import * as db from './models/db.js';
import * as staffModel from './models/staff.js';
import process from 'process';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import axios from 'axios';
import cron from 'node-cron';
const app = express();
const PORT = 3001;

staffModel.sync();

process.on('SIGINT', db.cleanup);
process.on('SIGTERM', db.cleanup);


app.use(cors({
    origin: 'http://localhost:3000'
  }));

app.get('/', (req, res) => {
    res.send('Express App containing api calls for push notifications');
  });

// Middleware
app.use(express.json());
app.use(logger('dev'));
app.use(cookieParser());


app.use('/get', userRoutes);
app.use('/send', notificationRoutes);
app.use('/staff', staffRoutes);

// Schedule a cron job to run daily at 9 AM
cron.schedule('00 10 * * *', () => {
  console.log('Sending scheduled notifications at 09:00');
  axios.get('http://localhost:3001/send')
    .then(response => {
      console.log('Send route triggered:', response.data);
    })
    .catch(error => {
      console.error('Error triggering send route:', error);
    });
}, {
  timezone: "Asia/Singapore"
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});