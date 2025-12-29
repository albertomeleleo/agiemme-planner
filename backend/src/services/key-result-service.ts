import * as KeyResultModel from '../models/key-result';
import * as ProgressUpdateModel from '../models/progress-update';
import * as ObjectiveService from './objective-service';
import { createError } from '../api/middleware/error-handler';

/**
 * KeyResultService
 * Business logic for key result management and progress tracking
 */

export interface KeyResultWithProgress extends KeyResultModel.KeyResult {
  progressHistory: ProgressUpdateModel.ProgressUpdate[];
}

export interface UpdateProgressRequest {
  keyResultId: string;
  valueRecorded: number;
  notes?: string;
}

/**
 * Get key result with progress history
 */
export async function getKeyResultWithProgress(
  keyResultId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
): Promise<KeyResultWithProgress | null> {
  const keyResult = await KeyResultModel.findKeyResultById(keyResultId);

  if (!keyResult) {
    return null;
  }

  const progressHistory = await ProgressUpdateModel.findProgressUpdatesByKeyResultId(
    keyResultId,
    options
  );

  return {
    ...keyResult,
    progressHistory,
  };
}

/**
 * Update key result progress
 * Creates progress update which triggers auto-update of key result current_value
 * Also checks and updates objective completion status
 */
export async function updateProgress(
  data: UpdateProgressRequest
): Promise<ProgressUpdateModel.ProgressUpdate> {
  // Verify key result exists
  const keyResult = await KeyResultModel.findKeyResultById(data.keyResultId);
  if (!keyResult) {
    throw createError('Key result not found', 404, 'KEY_RESULT_NOT_FOUND');
  }

  // Validate progress value
  if (data.valueRecorded < 0) {
    throw createError('Progress value cannot be negative', 400, 'INVALID_PROGRESS_VALUE');
  }

  // Create progress update (triggers auto-update of key result)
  const progressUpdate = await ProgressUpdateModel.createProgressUpdate({
    keyResultId: data.keyResultId,
    valueRecorded: data.valueRecorded,
    notes: data.notes,
  });

  // Check if objective should be auto-completed
  await ObjectiveService.checkAndUpdateObjectiveCompletion(keyResult.objectiveId);

  return progressUpdate;
}

/**
 * Update key result details
 */
export async function updateKeyResult(
  keyResultId: string,
  data: KeyResultModel.UpdateKeyResultData
): Promise<KeyResultModel.KeyResult | null> {
  // Validate deadline if provided
  if (data.deadline) {
    const keyResult = await KeyResultModel.findKeyResultById(keyResultId);
    if (!keyResult) {
      throw createError('Key result not found', 404, 'KEY_RESULT_NOT_FOUND');
    }

    // Get parent objective to validate deadline
    const objective = await ObjectiveService.getObjectiveWithKeyResults(keyResult.objectiveId);
    if (objective && data.deadline > objective.targetDate) {
      throw createError(
        'Key result deadline must be on or before the objective target date',
        400,
        'INVALID_DEADLINE'
      );
    }
  }

  return await KeyResultModel.updateKeyResult(keyResultId, data);
}

/**
 * Delete key result
 * Validates that objective will still have minimum 2 key results
 */
export async function deleteKeyResult(keyResultId: string): Promise<boolean> {
  const keyResult = await KeyResultModel.findKeyResultById(keyResultId);
  if (!keyResult) {
    return false;
  }

  // Check remaining key results count for objective
  const allKeyResults = await KeyResultModel.findKeyResultsByObjectiveId(keyResult.objectiveId);

  // Per FR-002: Objectives must have 2-5 key results
  if (allKeyResults.length <= 2) {
    throw createError(
      'Cannot delete key result. Objectives must have at least 2 key results.',
      400,
      'MINIMUM_KEY_RESULTS_REQUIRED'
    );
  }

  return await KeyResultModel.deleteKeyResult(keyResultId);
}

/**
 * Get at-risk key results for user
 */
export async function getAtRiskKeyResults(userId: string): Promise<KeyResultModel.KeyResult[]> {
  return await KeyResultModel.getAtRiskKeyResults(userId);
}

/**
 * Get progress trend data for key result
 * Returns array of progress points for visualization
 */
export async function getProgressTrend(
  keyResultId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Array<{ date: Date; value: number; percentage: number }>> {
  const keyResult = await KeyResultModel.findKeyResultById(keyResultId);
  if (!keyResult) {
    throw createError('Key result not found', 404, 'KEY_RESULT_NOT_FOUND');
  }

  const progressHistory = await ProgressUpdateModel.findProgressUpdatesByKeyResultId(
    keyResultId,
    options
  );

  // Map to trend data with percentage calculations
  return progressHistory.map((update) => ({
    date: update.recordedAt,
    value: update.valueRecorded,
    percentage: Math.min((update.valueRecorded / keyResult.targetValue) * 100, 100),
  }));
}

/**
 * Batch update multiple key results current values
 * Useful for bulk imports or synchronization
 */
export async function batchUpdateProgress(
  updates: UpdateProgressRequest[]
): Promise<ProgressUpdateModel.ProgressUpdate[]> {
  const results: ProgressUpdateModel.ProgressUpdate[] = [];
  const objectiveIds = new Set<string>();

  // Process each update
  for (const update of updates) {
    const keyResult = await KeyResultModel.findKeyResultById(update.keyResultId);
    if (!keyResult) {
      throw createError(
        `Key result not found: ${update.keyResultId}`,
        404,
        'KEY_RESULT_NOT_FOUND'
      );
    }

    objectiveIds.add(keyResult.objectiveId);

    const progressUpdate = await ProgressUpdateModel.createProgressUpdate({
      keyResultId: update.keyResultId,
      valueRecorded: update.valueRecorded,
      notes: update.notes,
    });

    results.push(progressUpdate);
  }

  // Check objective completion for all affected objectives
  for (const objectiveId of objectiveIds) {
    await ObjectiveService.checkAndUpdateObjectiveCompletion(objectiveId);
  }

  return results;
}
