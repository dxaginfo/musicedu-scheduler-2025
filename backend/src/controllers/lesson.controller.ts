import { Request, Response } from 'express';
import db from '../config/db';

// Get all lessons
export const getAllLessons = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;
    let query = db('lessons')
      .join('lesson_types', 'lessons.lesson_type_id', '=', 'lesson_types.lesson_type_id')
      .select(
        'lessons.*',
        'lesson_types.name as lesson_type_name',
        'lesson_types.duration',
        'lesson_types.max_students'
      );

    // Filter based on user role
    if (role === 'teacher') {
      query = query.where('lessons.teacher_id', userId);
    } else if (role === 'student') {
      query = query
        .join('lesson_participants', 'lessons.lesson_id', '=', 'lesson_participants.lesson_id')
        .where('lesson_participants.student_id', userId);
    } else if (role === 'parent') {
      // For parents, get lessons for their children
      const childIds = await db('parent_child_relationships')
        .where('parent_user_id', userId)
        .pluck('child_user_id');
      
      query = query
        .join('lesson_participants', 'lessons.lesson_id', '=', 'lesson_participants.lesson_id')
        .whereIn('lesson_participants.student_id', childIds);
    }

    // Handle query parameters
    const { startDate, endDate, status } = req.query;
    if (startDate) {
      query = query.where('lessons.start_time', '>=', startDate);
    }
    if (endDate) {
      query = query.where('lessons.end_time', '<=', endDate);
    }
    if (status) {
      query = query.where('lessons.status', status);
    }

    const lessons = await query.orderBy('lessons.start_time');

    // Get participants for each lesson
    const lessonsWithParticipants = await Promise.all(
      lessons.map(async (lesson) => {
        const participants = await db('lesson_participants')
          .join('users', 'lesson_participants.student_id', '=', 'users.user_id')
          .where('lesson_participants.lesson_id', lesson.lesson_id)
          .select(
            'users.user_id',
            'users.first_name',
            'users.last_name',
            'lesson_participants.attendance_status'
          );

        return {
          ...lesson,
          participants,
        };
      })
    );

    return res.json(lessonsWithParticipants);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return res.status(500).json({ message: 'Server error fetching lessons' });
  }
};

// Get a single lesson by ID
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    let query = db('lessons')
      .join('lesson_types', 'lessons.lesson_type_id', '=', 'lesson_types.lesson_type_id')
      .where('lessons.lesson_id', id)
      .first()
      .select(
        'lessons.*',
        'lesson_types.name as lesson_type_name',
        'lesson_types.duration',
        'lesson_types.max_students'
      );

    // Check permissions based on user role
    if (role === 'teacher') {
      query = query.andWhere('lessons.teacher_id', userId);
    } else if (role === 'student') {
      const canAccess = await db('lesson_participants')
        .where({
          'lesson_id': id,
          'student_id': userId,
        })
        .first();
      
      if (!canAccess) {
        return res.status(403).json({ message: 'Not authorized to access this lesson' });
      }
    } else if (role === 'parent') {
      // For parents, check if lesson involves their children
      const childIds = await db('parent_child_relationships')
        .where('parent_user_id', userId)
        .pluck('child_user_id');
      
      const canAccess = await db('lesson_participants')
        .where('lesson_id', id)
        .whereIn('student_id', childIds)
        .first();
      
      if (!canAccess) {
        return res.status(403).json({ message: 'Not authorized to access this lesson' });
      }
    }

    const lesson = await query;

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Get participants
    const participants = await db('lesson_participants')
      .join('users', 'lesson_participants.student_id', '=', 'users.user_id')
      .where('lesson_participants.lesson_id', id)
      .select(
        'users.user_id',
        'users.first_name',
        'users.last_name',
        'lesson_participants.attendance_status'
      );

    // Get teacher info
    const teacher = await db('users')
      .where('user_id', lesson.teacher_id)
      .first()
      .select('user_id', 'first_name', 'last_name', 'email');

    return res.json({
      ...lesson,
      teacher,
      participants,
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return res.status(500).json({ message: 'Server error fetching lesson' });
  }
};

// Create a new lesson
export const createLesson = async (req: Request, res: Response) => {
  try {
    const {
      lessonTypeId,
      startTime,
      endTime,
      locationType,
      locationDetails,
      studentIds,
    } = req.body;

    // @ts-ignore - User is attached in auth middleware
    const { id: teacherId, role } = req.user;

    // Check if user is a teacher or admin
    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers and admins can create lessons' });
    }

    // Insert the lesson
    const [lessonId] = await db('lessons').insert({
      teacher_id: teacherId,
      lesson_type_id: lessonTypeId,
      start_time: startTime,
      end_time: endTime,
      status: 'scheduled',
      location_type: locationType,
      location_details: locationDetails,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('lesson_id');

    // Add participants
    await Promise.all(
      studentIds.map((studentId: string) => {
        return db('lesson_participants').insert({
          lesson_id: lessonId,
          student_id: studentId,
          attendance_status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        });
      })
    );

    // Fetch the created lesson with details
    const lesson = await db('lessons')
      .join('lesson_types', 'lessons.lesson_type_id', '=', 'lesson_types.lesson_type_id')
      .where('lessons.lesson_id', lessonId)
      .first()
      .select(
        'lessons.*',
        'lesson_types.name as lesson_type_name',
        'lesson_types.duration',
        'lesson_types.max_students'
      );

    // Get participants
    const participants = await db('lesson_participants')
      .join('users', 'lesson_participants.student_id', '=', 'users.user_id')
      .where('lesson_participants.lesson_id', lessonId)
      .select(
        'users.user_id',
        'users.first_name',
        'users.last_name',
        'lesson_participants.attendance_status'
      );

    return res.status(201).json({
      message: 'Lesson created successfully',
      lesson: {
        ...lesson,
        participants,
      },
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return res.status(500).json({ message: 'Server error creating lesson' });
  }
};

// Update a lesson
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      lessonTypeId,
      startTime,
      endTime,
      status,
      locationType,
      locationDetails,
      studentIds,
    } = req.body;

    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    // Check permissions
    const lesson = await db('lessons').where('lesson_id', id).first();

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Only the teacher who created the lesson or an admin can update it
    if (role !== 'admin' && lesson.teacher_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    // Update lesson details
    await db('lessons')
      .where('lesson_id', id)
      .update({
        lesson_type_id: lessonTypeId,
        start_time: startTime,
        end_time: endTime,
        status,
        location_type: locationType,
        location_details: locationDetails,
        updated_at: new Date(),
      });

    // Update participants if provided
    if (studentIds && Array.isArray(studentIds)) {
      // Remove existing participants
      await db('lesson_participants').where('lesson_id', id).del();

      // Add new participants
      await Promise.all(
        studentIds.map((studentId: string) => {
          return db('lesson_participants').insert({
            lesson_id: id,
            student_id: studentId,
            attendance_status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          });
        })
      );
    }

    // Fetch the updated lesson with details
    const updatedLesson = await db('lessons')
      .join('lesson_types', 'lessons.lesson_type_id', '=', 'lesson_types.lesson_type_id')
      .where('lessons.lesson_id', id)
      .first()
      .select(
        'lessons.*',
        'lesson_types.name as lesson_type_name',
        'lesson_types.duration',
        'lesson_types.max_students'
      );

    // Get participants
    const participants = await db('lesson_participants')
      .join('users', 'lesson_participants.student_id', '=', 'users.user_id')
      .where('lesson_participants.lesson_id', id)
      .select(
        'users.user_id',
        'users.first_name',
        'users.last_name',
        'lesson_participants.attendance_status'
      );

    return res.json({
      message: 'Lesson updated successfully',
      lesson: {
        ...updatedLesson,
        participants,
      },
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return res.status(500).json({ message: 'Server error updating lesson' });
  }
};

// Delete a lesson
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    // Check permissions
    const lesson = await db('lessons').where('lesson_id', id).first();

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Only the teacher who created the lesson or an admin can delete it
    if (role !== 'admin' && lesson.teacher_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    // Delete related records first
    await db('lesson_participants').where('lesson_id', id).del();

    // Delete the lesson
    await db('lessons').where('lesson_id', id).del();

    return res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return res.status(500).json({ message: 'Server error deleting lesson' });
  }
};

// Update attendance for a lesson
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { attendanceRecords } = req.body;

    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    // Check permissions
    const lesson = await db('lessons').where('lesson_id', id).first();

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Only the teacher who created the lesson or an admin can update attendance
    if (role !== 'admin' && lesson.teacher_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update attendance' });
    }

    // Update attendance for each student
    await Promise.all(
      attendanceRecords.map(async (record: { studentId: string; status: string; notes?: string }) => {
        await db('lesson_participants')
          .where({
            lesson_id: id,
            student_id: record.studentId,
          })
          .update({
            attendance_status: record.status,
            notes: record.notes,
            updated_at: new Date(),
          });
      })
    );

    return res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({ message: 'Server error updating attendance' });
  }
};
