import { Request, Response } from 'express';
import db from '../config/db';

// Get all materials
export const getAllMaterials = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;
    let query = db('practice_materials');

    // Filtering by role (teachers can see all materials they created, 
    // students can see materials assigned to them)
    if (role === 'teacher') {
      query = query.where('created_by', userId);
    } else if (role === 'student') {
      query = query
        .join('student_materials', 'practice_materials.material_id', '=', 'student_materials.material_id')
        .where('student_materials.student_id', userId)
        .select('practice_materials.*', 'student_materials.completion_status');
    } else if (role === 'parent') {
      // Parents can see materials assigned to their children
      const childIds = await db('parent_child_relationships')
        .where('parent_user_id', userId)
        .pluck('child_user_id');
      
      query = query
        .join('student_materials', 'practice_materials.material_id', '=', 'student_materials.material_id')
        .whereIn('student_materials.student_id', childIds)
        .select('practice_materials.*', 'student_materials.completion_status', 'student_materials.student_id');
    }

    const materials = await query.orderBy('created_at', 'desc');

    // Get creator info for each material
    const materialsWithCreators = await Promise.all(
      materials.map(async (material) => {
        const creator = await db('users')
          .where('user_id', material.created_by)
          .first()
          .select('user_id', 'first_name', 'last_name');

        return {
          ...material,
          creator,
        };
      })
    );

    return res.json(materialsWithCreators);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return res.status(500).json({ message: 'Server error fetching materials' });
  }
};

// Get a single material by ID
export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    // Find the material
    const material = await db('practice_materials')
      .where('material_id', id)
      .first();

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check access permissions based on role
    if (role === 'teacher') {
      // Teachers can access materials they created
      if (material.created_by !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this material' });
      }
    } else if (role === 'student') {
      // Students can access materials assigned to them
      const assignment = await db('student_materials')
        .where({
          material_id: id,
          student_id: userId,
        })
        .first();

      if (!assignment) {
        return res.status(403).json({ message: 'Not authorized to access this material' });
      }
    } else if (role === 'parent') {
      // Parents can access materials assigned to their children
      const childIds = await db('parent_child_relationships')
        .where('parent_user_id', userId)
        .pluck('child_user_id');
      
      const assignment = await db('student_materials')
        .where('material_id', id)
        .whereIn('student_id', childIds)
        .first();

      if (!assignment) {
        return res.status(403).json({ message: 'Not authorized to access this material' });
      }
    }

    // Get creator info
    const creator = await db('users')
      .where('user_id', material.created_by)
      .first()
      .select('user_id', 'first_name', 'last_name', 'email');

    // Get assigned students
    const assignments = await db('student_materials')
      .join('users', 'student_materials.student_id', '=', 'users.user_id')
      .where('student_materials.material_id', id)
      .select(
        'users.user_id',
        'users.first_name',
        'users.last_name',
        'student_materials.assigned_date',
        'student_materials.due_date',
        'student_materials.completion_status'
      );

    return res.json({
      ...material,
      creator,
      assignments,
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    return res.status(500).json({ message: 'Server error fetching material' });
  }
};

// Create a new material
export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { title, description, fileUrl, studentIds, dueDate } = req.body;

    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    // Only teachers and admins can create materials
    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers and admins can create materials' });
    }

    // Insert the material
    const [materialId] = await db('practice_materials').insert({
      title,
      description,
      file_url: fileUrl,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('material_id');

    // Assign to students if provided
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      await Promise.all(
        studentIds.map((studentId: string) => {
          return db('student_materials').insert({
            material_id: materialId,
            student_id: studentId,
            assigned_date: new Date(),
            due_date: dueDate || null,
            completion_status: 'assigned',
            created_at: new Date(),
            updated_at: new Date(),
          });
        })
      );
    }

    // Fetch the created material
    const material = await db('practice_materials')
      .where('material_id', materialId)
      .first();

    return res.status(201).json({
      message: 'Material created successfully',
      material,
    });
  } catch (error) {
    console.error('Error creating material:', error);
    return res.status(500).json({ message: 'Server error creating material' });
  }
};

// Update a material
export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl, studentIds, dueDate } = req.body;

    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    // Check if material exists
    const material = await db('practice_materials')
      .where('material_id', id)
      .first();

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check permissions - only creator or admin can update
    if (role !== 'admin' && material.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this material' });
    }

    // Update material
    await db('practice_materials')
      .where('material_id', id)
      .update({
        title,
        description,
        file_url: fileUrl,
        updated_at: new Date(),
      });

    // Update assignments if provided
    if (studentIds && Array.isArray(studentIds)) {
      // Remove existing assignments
      await db('student_materials').where('material_id', id).del();

      // Add new assignments
      if (studentIds.length > 0) {
        await Promise.all(
          studentIds.map((studentId: string) => {
            return db('student_materials').insert({
              material_id: id,
              student_id: studentId,
              assigned_date: new Date(),
              due_date: dueDate || null,
              completion_status: 'assigned',
              created_at: new Date(),
              updated_at: new Date(),
            });
          })
        );
      }
    }

    // Fetch the updated material
    const updatedMaterial = await db('practice_materials')
      .where('material_id', id)
      .first();

    return res.json({
      message: 'Material updated successfully',
      material: updatedMaterial,
    });
  } catch (error) {
    console.error('Error updating material:', error);
    return res.status(500).json({ message: 'Server error updating material' });
  }
};

// Delete a material
export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    // Check if material exists
    const material = await db('practice_materials')
      .where('material_id', id)
      .first();

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check permissions - only creator or admin can delete
    if (role !== 'admin' && material.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this material' });
    }

    // Delete related records first
    await db('student_materials').where('material_id', id).del();

    // Delete the material
    await db('practice_materials').where('material_id', id).del();

    return res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    return res.status(500).json({ message: 'Server error deleting material' });
  }
};

// Update completion status for a student's material
export const updateCompletionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completionStatus, feedback } = req.body;

    // @ts-ignore - User is attached in auth middleware
    const { id: userId, role } = req.user;

    // Check if material exists
    const material = await db('practice_materials')
      .where('material_id', id)
      .first();

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Students can only update their own status
    if (role === 'student') {
      await db('student_materials')
        .where({
          material_id: id,
          student_id: userId,
        })
        .update({
          completion_status: completionStatus,
          updated_at: new Date(),
        });
    } 
    // Teachers can update status and provide feedback
    else if (role === 'teacher' || role === 'admin') {
      const { studentId } = req.body;
      if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
      }

      await db('student_materials')
        .where({
          material_id: id,
          student_id: studentId,
        })
        .update({
          completion_status: completionStatus,
          feedback,
          updated_at: new Date(),
        });
    } else {
      return res.status(403).json({ message: 'Not authorized to update completion status' });
    }

    return res.json({ message: 'Completion status updated successfully' });
  } catch (error) {
    console.error('Error updating completion status:', error);
    return res.status(500).json({ message: 'Server error updating completion status' });
  }
};
