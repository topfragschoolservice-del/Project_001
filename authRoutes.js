import express from 'express';
import { signup, login, logout, refresh, forgotPassword } from './authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgotPassword', forgotPassword);

export default router;