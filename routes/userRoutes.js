import express from 'express';
import getRecentUser from '../controllers/userController.js';


const router = express.Router();

router.get('/user', getRecentUser);

export default router;