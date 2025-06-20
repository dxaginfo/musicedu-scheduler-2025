import express from 'express';
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  updateAttendance,
} from '../controllers/lesson.controller';
import auth from '../middleware/auth';
import { validateLesson, validateAttendance } from '../middleware/validators';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all lessons
router.get('/', getAllLessons);

// Get a single lesson
router.get('/:id', getLessonById);

// Create a new lesson
router.post('/', validateLesson, createLesson);

// Update a lesson
router.put('/:id', validateLesson, updateLesson);

// Delete a lesson
router.delete('/:id', deleteLesson);

// Update attendance for a lesson
router.put('/:id/attendance', validateAttendance, updateAttendance);

export default router;
