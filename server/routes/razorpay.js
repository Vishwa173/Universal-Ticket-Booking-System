import express from 'express';
import { createOrder } from '../controllers/razorpayController.js';

const router = express.Router();

router.post('/create-order', createOrder);

export default router;
