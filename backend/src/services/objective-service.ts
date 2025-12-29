import * as ObjectiveModel from '../models/objective';
import * as KeyResultModel from '../models/key-result';
import { createError } from '../api/middleware/error-handler';

/**
 * ObjectiveService
 * Business logic for OKR management
 * Per data-model.md: Objectives must have 2-5 key results (FR-002)
 */

export interface ObjectiveWithKeyResults extends ObjectiveModel.Objective {
  keyResults: KeyResultModel.KeyResult[];
}

export interface CreateObjectiveRequest {
  userId: string;
  title: string;
  description?: string;
  category: ObjectiveModel.ObjectiveCategory;
  targetDate: Date;
  keyResults: Array<{
    description: string;
    targetValue: number;
    unit: string;
    deadline: Date;
  }>;
}

/**
 * Create objective with key results
 * Validates 2-5 key results requirement (FR-002)
 */
export async function createObjectiveWithKeyResults(
  data: CreateObjectiveRequest
): Promise<ObjectiveWithKeyResults> {
  // Validate key results count (FR-002: 2-5 key results)
  if (data.keyResults.length < 2 || data.keyResults.length > 5) {
    throw createError(
      'Each objective must have between 2 and 5 key results',
      400,
      'INVALID_KEY_RESULTS_COUNT'
    );
  }

  // Validate all key result deadlines are <= objective target date
  const invalidDeadlines = data.keyResults.filter((kr) => kr.deadline > data.targetDate);
  if (invalidDeadlines.length > 0) {
    throw createError(
      'All key result deadlines must be on or before the objective target date',
      400,
      'INVALID_DEADLINE'
    );
  }

  // Create objective
  const objective = await ObjectiveModel.createObjective({
    userId: data.userId,
    title: data.title,
    description: data.description,
    category: data.category,
    targetDate: data.targetDate,
  });

  // Create key results
  const keyResults = await Promise.all(
    data.keyResults.map((kr) =>
      KeyResultModel.createKeyResult({
        objectiveId: objective.id,
        description: kr.description,
        targetValue: kr.targetValue,
        unit: kr.unit,
        deadline: kr.deadline,
      })
    )
  );

  return {
    ...objective,
    keyResults,
  };
}

/**
 * Get objective with key results
 */
export async function getObjectiveWithKeyResults(
  objectiveId: string
): Promise<ObjectiveWithKeyResults | null> {
  const objective = await ObjectiveModel.findObjectiveById(objectiveId);

  if (!objective) {
    return null;
  }

  const keyResults = await KeyResultModel.findKeyResultsByObjectiveId(objectiveId);

  return {
    ...objective,
    keyResults,
  };
}

/**
 * Get all objectives for user with their key results
 */
export async function getUserObjectivesWithKeyResults(
  userId: string,
  filters?: {
    category?: ObjectiveModel.ObjectiveCategory;
    status?: ObjectiveModel.ObjectiveStatus;
  }
): Promise<ObjectiveWithKeyResults[]> {
  const objectives = await ObjectiveModel.findObjectivesByUserId(userId, filters);

  // Fetch key results for each objective
  const objectivesWithKeyResults = await Promise.all(
    objectives.map(async (objective) => {
      const keyResults = await KeyResultModel.findKeyResultsByObjectiveId(objective.id);
      return {
        ...objective,
        keyResults,
      };
    })
  );

  return objectivesWithKeyResults;
}

/**
 * Update objective
 * Validates ownership via userId check in controller
 */
export async function updateObjective(
  objectiveId: string,
  data: ObjectiveModel.UpdateObjectiveData
): Promise<ObjectiveModel.Objective | null> {
  return await ObjectiveModel.updateObjective(objectiveId, data);
}

/**
 * Delete objective
 * Cascades to key results per database constraints
 */
export async function deleteObjective(objectiveId: string): Promise<boolean> {
  return await ObjectiveModel.deleteObjective(objectiveId);
}

/**
 * Check if all key results are completed to auto-complete objective
 */
export async function checkAndUpdateObjectiveCompletion(
  objectiveId: string
): Promise<void> {
  const keyResults = await KeyResultModel.findKeyResultsByObjectiveId(objectiveId);

  // If all key results are completed, mark objective as completed
  const allCompleted = keyResults.length > 0 && keyResults.every((kr) => kr.status === 'completed');

  if (allCompleted) {
    await ObjectiveModel.updateObjective(objectiveId, { status: 'completed' });
  }
}
