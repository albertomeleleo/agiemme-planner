import { Router, Request, Response } from 'express';
import * as ObjectiveService from '../../services/objective-service';
import * as ObjectiveModel from '../../models/objective';
import { createError } from '../middleware/error-handler';
import { requireAuth } from '../middleware/auth';

/**
 * Objectives routes
 * GET /api/objectives - Get all user objectives
 * POST /api/objectives - Create objective with key results
 * GET /api/objectives/:id - Get objective with key results
 * PUT /api/objectives/:id - Update objective
 * DELETE /api/objectives/:id - Delete objective
 */

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Get all objectives for current user
 * Query params: category, status
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const { category, status } = req.query;

    const filters: {
      category?: ObjectiveModel.ObjectiveCategory;
      status?: ObjectiveModel.ObjectiveStatus;
    } = {};

    if (category) {
      filters.category = category as ObjectiveModel.ObjectiveCategory;
    }

    if (status) {
      filters.status = status as ObjectiveModel.ObjectiveStatus;
    }

    const objectives = await ObjectiveService.getUserObjectivesWithKeyResults(userId, filters);

    res.status(200).json({
      objectives,
      count: objectives.length,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Create objective with key results
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const { title, description, category, targetDate, keyResults } = req.body;

    // Validate required fields
    if (!title || !category || !targetDate || !keyResults) {
      throw createError(
        'Missing required fields: title, category, targetDate, keyResults',
        400,
        'MISSING_FIELDS'
      );
    }

    // Validate title length
    if (title.length < 5 || title.length > 200) {
      throw createError('Title must be between 5 and 200 characters', 400, 'INVALID_TITLE');
    }

    // Validate category
    const validCategories: ObjectiveModel.ObjectiveCategory[] = [
      'career',
      'health',
      'relationships',
      'skills',
      'financial',
      'personal',
    ];
    if (!validCategories.includes(category)) {
      throw createError('Invalid category', 400, 'INVALID_CATEGORY');
    }

    // Validate targetDate is in the future
    const target = new Date(targetDate);
    if (target <= new Date()) {
      throw createError('Target date must be in the future', 400, 'INVALID_TARGET_DATE');
    }

    // Validate key results array
    if (!Array.isArray(keyResults)) {
      throw createError('Key results must be an array', 400, 'INVALID_KEY_RESULTS');
    }

    // Validate each key result
    for (const kr of keyResults) {
      if (!kr.description || !kr.targetValue || !kr.unit || !kr.deadline) {
        throw createError(
          'Each key result must have description, targetValue, unit, and deadline',
          400,
          'INVALID_KEY_RESULT'
        );
      }

      if (kr.targetValue <= 0) {
        throw createError('Key result target value must be positive', 400, 'INVALID_TARGET_VALUE');
      }

      const krDeadline = new Date(kr.deadline);
      if (krDeadline > target) {
        throw createError(
          'Key result deadlines must be on or before objective target date',
          400,
          'INVALID_DEADLINE'
        );
      }
    }

    // Create objective with key results
    const objective = await ObjectiveService.createObjectiveWithKeyResults({
      userId,
      title,
      description,
      category,
      targetDate: target,
      keyResults: keyResults.map((kr: any) => ({
        description: kr.description,
        targetValue: parseFloat(kr.targetValue),
        unit: kr.unit,
        deadline: new Date(kr.deadline),
      })),
    });

    res.status(201).json(objective);
  } catch (error) {
    throw error;
  }
});

/**
 * Get objective by ID with key results
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const id: string = req.params.id!;

    const objective = await ObjectiveService.getObjectiveWithKeyResults(id);

    if (!objective) {
      throw createError('Objective not found', 404, 'OBJECTIVE_NOT_FOUND');
    }

    // Verify ownership
    if (objective.userId !== userId) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    res.status(200).json(objective);
  } catch (error) {
    throw error;
  }
});

/**
 * Update objective
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const id: string = req.params.id!;
    const { title, description, category, targetDate, status } = req.body;

    // Verify objective exists and user owns it
    const existing = await ObjectiveService.getObjectiveWithKeyResults(id);
    if (!existing) {
      throw createError('Objective not found', 404, 'OBJECTIVE_NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Build update data
    const updateData: ObjectiveModel.UpdateObjectiveData = {};

    if (title !== undefined) {
      if (title.length < 5 || title.length > 200) {
        throw createError('Title must be between 5 and 200 characters', 400, 'INVALID_TITLE');
      }
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (category !== undefined) {
      const validCategories: ObjectiveModel.ObjectiveCategory[] = [
        'career',
        'health',
        'relationships',
        'skills',
        'financial',
        'personal',
      ];
      if (!validCategories.includes(category)) {
        throw createError('Invalid category', 400, 'INVALID_CATEGORY');
      }
      updateData.category = category;
    }

    if (targetDate !== undefined) {
      const target = new Date(targetDate);
      // Validate all key results deadlines are still valid
      for (const kr of existing.keyResults) {
        if (kr.deadline > target) {
          throw createError(
            'Cannot set target date before existing key result deadlines',
            400,
            'INVALID_TARGET_DATE'
          );
        }
      }
      updateData.targetDate = target;
    }

    if (status !== undefined) {
      const validStatuses: ObjectiveModel.ObjectiveStatus[] = [
        'active',
        'completed',
        'archived',
        'abandoned',
      ];
      if (!validStatuses.includes(status)) {
        throw createError('Invalid status', 400, 'INVALID_STATUS');
      }
      updateData.status = status;
    }

    // Update objective
    const updated = await ObjectiveService.updateObjective(id, updateData);

    res.status(200).json(updated);
  } catch (error) {
    throw error;
  }
});

/**
 * Delete objective
 * Cascades to key results and progress updates
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const id: string = req.params.id!;

    // Verify objective exists and user owns it
    const existing = await ObjectiveService.getObjectiveWithKeyResults(id);
    if (!existing) {
      throw createError('Objective not found', 404, 'OBJECTIVE_NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Delete objective
    await ObjectiveService.deleteObjective(id);

    res.status(204).send();
  } catch (error) {
    throw error;
  }
});

export default router;
