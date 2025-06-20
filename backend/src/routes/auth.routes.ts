import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { validateRegistration, validateLogin } from '../middleware/validators';
import auth from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post('/register', validateRegistration, register);

// Login user
router.post('/login', validateLogin, login);

// Get current user profile
router.get('/me', auth, getMe);

export default router;
