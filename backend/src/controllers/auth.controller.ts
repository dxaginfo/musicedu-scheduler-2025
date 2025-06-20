import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db';

// User registration
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const [userId] = await db('users').insert({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('user_id');

    // Create profile based on role
    if (role === 'teacher') {
      await db('teacher_profiles').insert({
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } else if (role === 'student') {
      await db('student_profiles').insert({
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// User login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await db('users')
      .where({ email })
      .first();

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - User is attached in auth middleware
    const userId = req.user.id;

    const user = await db('users')
      .where({ user_id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional profile data based on role
    let profileData = {};
    if (user.role === 'teacher') {
      const teacherProfile = await db('teacher_profiles')
        .where({ user_id: userId })
        .first();
      profileData = teacherProfile || {};
    } else if (user.role === 'student') {
      const studentProfile = await db('student_profiles')
        .where({ user_id: userId })
        .first();
      profileData = studentProfile || {};
    }

    return res.json({
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        profile: profileData,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
};
