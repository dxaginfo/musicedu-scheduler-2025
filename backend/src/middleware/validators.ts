import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validate registration input
export const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('role')
    .isIn(['admin', 'teacher', 'student', 'parent'])
    .withMessage('Role must be admin, teacher, student, or parent'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate login input
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate lesson input
export const validateLesson = [
  body('lessonTypeId')
    .notEmpty()
    .withMessage('Lesson type is required'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('locationType')
    .isIn(['in-person', 'virtual'])
    .withMessage('Location type must be in-person or virtual'),
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('At least one student must be selected'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate attendance update
export const validateAttendance = [
  body('attendanceRecords')
    .isArray({ min: 1 })
    .withMessage('Attendance records are required'),
  body('attendanceRecords.*.studentId')
    .notEmpty()
    .withMessage('Student ID is required for each attendance record'),
  body('attendanceRecords.*.status')
    .isIn(['present', 'absent', 'late', 'excused'])
    .withMessage('Status must be present, absent, late, or excused'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate material input
export const validateMaterial = [
  body('title')
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('File URL must be a valid URL'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate completion status update
export const validateCompletionStatus = [
  body('completionStatus')
    .isIn(['assigned', 'in-progress', 'completed', 'reviewed'])
    .withMessage('Status must be assigned, in-progress, completed, or reviewed'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
