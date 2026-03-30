import express from 'express';
import { signup, login, logout, refresh } from './authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/refresh', refresh);

export default router;