import express from 'express';
import cors from'cors';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
const app = express();
const PORT = 3001;

app.use(cors({
    origin: 'http://localhost:3000'
  }));

app.get('/', (req, res) => {
    res.send('Express App containing api calls for push notifications');
  });

// Middleware
app.use(express.json());

app.use('/get', userRoutes);
app.use('/send', notificationRoutes);
app.use('/staff', staffRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});