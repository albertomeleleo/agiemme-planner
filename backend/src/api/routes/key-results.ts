import { Router, Request, Response } from 'express';
import * as KeyResultService from '../../services/key-result-service';
import * as KeyResultModel from '../../models/key-result';
import * as ObjectiveModel from '../../models/objective';
import { createError } from '../middleware/error-handler';
import { requireAuth } from '../middleware/auth';

/**
 * Key Results routes
 * GET /api/key-results/:id - Get key result with progress history
 * PUT /api/key-results/:id - Update key result
 * DELETE /api/key-results/:id - Delete key result
 * POST /api/key-results/:id/progress - Record progress update
 * GET /api/key-results/:id/trend - Get progress trend data
 * GET /api/key-results/at-risk - Get at-risk key results for user
 */

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Get at-risk key results for current user
 */
router.get('/at-risk', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;

    const atRiskKeyResults = await KeyResultService.getAtRiskKeyResults(userId);

    res.status(200).json({
      keyResults: atRiskKeyResults,
      count: atRiskKeyResults.length,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Get key result with progress history
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const id: string = req.params.id!;
    const { startDate, endDate } = req.query;

    const options: { startDate?: Date; endDate?: Date } = {};
    if (startDate) {
      options.startDate = new Date(startDate as string);
    }
    if (endDate) {
      options.endDate = new Date(endDate as string);
    }

    const keyResult = await KeyResultService.getKeyResultWithProgress(id, options);

    if (!keyResult) {
      throw createError('Key result not found', 404, 'KEY_RESULT_NOT_FOUND');
    }

    // Verify ownership through objective
    const objective = await ObjectiveModel.findObjectiveById(keyResult.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    res.status(200).json(keyResult);
  } catch (error) {
    throw error;
  }
});

/**
 * Update key result
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const id: string = req.params.id!;
    const { description, targetValue, currentValue, unit, deadline } = req.body;

    // Verify key result exists
    const existing = await KeyResultModel.findKeyResultById(id);
    if (!existing) {
      throw createError('Key result not found', 404, 'KEY_RESULT_NOT_FOUND');
    }

    // Verify ownership through objective
    const objective = await ObjectiveModel.findObjectiveById(existing.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Build update data
    const updateData: KeyResultModel.UpdateKeyResultData = {};

    if (description !== undefined) {
      if (description.length < 5) {
        throw createError('Description must be at least 5 characters', 400, 'INVALID_DESCRIPTION');
      }
      updateData.description = description;
    }

    if (targetValue !== undefined) {
      if (targetValue <= 0) {
        throw createError('Target value must be positive', 400, 'INVALID_TARGET_VALUE');
      }
      updateData.targetValue = parseFloat(targetValue);
    }

    if (currentValue !== undefined) {
      if (currentValue < 0) {
        throw createError('Current value cannot be negative', 400, 'INVALID_CURRENT_VALUE');
      }
      updateData.currentValue = parseFloat(currentValue);
    }

    if (unit !== undefined) {
      updateData.unit = unit;
    }

    if (deadline !== undefined) {
      updateData.deadline = new Date(deadline);
    }

    // Update key result (service validates deadline against objective)
    const updated = await KeyResultService.updateKeyResult(id, updateData);

    res.status(200).json(updated);
  } catch (error) {
    throw error;
  }
});

/**
 * Delete key result
 * Validates minimum 2 key results per objective (FR-002)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const id: string = req.params.id!;

    // Verify key result exists
    const existing = await KeyResultModel.findKeyResultById(id);
    if (!existing) {
      throw createError('Key result not found', 404, 'KEY_RESULT_NOT_FOUND');
    }

    // Verify ownership through objective
    const objective = await ObjectiveModel.findObjectiveById(existing.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Delete key result (service validates minimum count)
    await KeyResultService.deleteKeyResult(id);

    res.status(204).send();
  } catch (error) {
    throw error;
  }
});

/**
 * Record progress update
 */
router.post('/:id/progress', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const id: string = req.params.id!;
    const { valueRecorded, notes } = req.body;

    // Validate input
    if (valueRecorded === undefined || valueRecorded === null) {
      throw createError('valueRecorded is required', 400, 'MISSING_FIELD');
    }

    // Verify key result exists
    const keyResult = await KeyResultModel.findKeyResultById(id);
    if (!keyResult) {
      throw createError('Key result not found', 404, 'KEY_RESULT_NOT_FOUND');
    }

    // Verify ownership through objective
    const objective = await ObjectiveModel.findObjectiveById(keyResult.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Record progress
    const progressUpdate = await KeyResultService.updateProgress({
      keyResultId: id,
      valueRecorded: parseFloat(valueRecorded),
      notes,
    });

    // Fetch updated key result to return with new status
    const updatedKeyResult = await KeyResultModel.findKeyResultById(id);

    res.status(201).json({
      progressUpdate,
      keyResult: updatedKeyResult,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Get progress trend data
 */
router.get('/:id/trend', async (req: Request, res: Response) => {
  try {
    const userId: string = req.user!.userId;
    const id: string = req.params.id!;
    const { startDate, endDate } = req.query;

    // Verify key result exists
    const keyResult = await KeyResultModel.findKeyResultById(id);
    if (!keyResult) {
      throw createError('Key result not found', 404, 'KEY_RESULT_NOT_FOUND');
    }

    // Verify ownership through objective
    const objective = await ObjectiveModel.findObjectiveById(keyResult.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    const options: { startDate?: Date; endDate?: Date } = {};
    if (startDate) {
      options.startDate = new Date(startDate as string);
    }
    if (endDate) {
      options.endDate = new Date(endDate as string);
    }

    const trendData = await KeyResultService.getProgressTrend(id, options);

    res.status(200).json({
      keyResultId: id,
      targetValue: keyResult.targetValue,
      unit: keyResult.unit,
      trendData,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
