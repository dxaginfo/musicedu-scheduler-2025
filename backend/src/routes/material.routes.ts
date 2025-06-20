import express from 'express';
import {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  updateCompletionStatus,
} from '../controllers/material.controller';
import auth from '../middleware/auth';
import { validateMaterial, validateCompletionStatus } from '../middleware/validators';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all materials
router.get('/', getAllMaterials);

// Get a single material
router.get('/:id', getMaterialById);

// Create a new material
router.post('/', validateMaterial, createMaterial);

// Update a material
router.put('/:id', validateMaterial, updateMaterial);

// Delete a material
router.delete('/:id', deleteMaterial);

// Update completion status
router.put('/:id/completion', validateCompletionStatus, updateCompletionStatus);

export default router;
