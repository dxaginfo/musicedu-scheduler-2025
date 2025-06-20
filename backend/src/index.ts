import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import studentRoutes from './routes/student.routes';
import teacherRoutes from './routes/teacher.routes';
import lessonRoutes from './routes/lesson.routes';
import materialRoutes from './routes/material.routes';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 5000);
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/materials', materialRoutes);

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Music Education Scheduler API is running',
    timestamp: new Date(),
    version: '1.0.0',
  });
});

// Start Express server
app.listen(app.get('port'), () => {
  console.log(
    `🚀 Server started on http://localhost:${app.get('port')} in ${app.get('env')} mode`
  );
  console.log('Press CTRL-C to stop');
});

export default app;
