import express from 'express';
import sendNotification from '../controllers/notificationController.js';


const router = express.Router();

router.get('/:id/:msg', sendNotification);

export default router;