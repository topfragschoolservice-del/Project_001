import express from 'express';
import { signup, login, logout, refresh, forgotPassword, resetPassword } from './authController.js';
import { signupValidator, loginValidator } from './validators.js';

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.get('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;