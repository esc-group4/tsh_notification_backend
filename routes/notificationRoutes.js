import express from 'express';
import { scheduleNotification } from '../controllers/notificationController.js';


const router = express.Router();

router.get('/', scheduleNotification);

export default router;