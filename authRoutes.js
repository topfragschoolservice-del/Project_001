import express from 'express';
import { signup, login, logout, refresh, forgotPassword, resetPassword } from './authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;