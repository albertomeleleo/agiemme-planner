import api from './api';

/**
 * Objectives API Service
 * Handles CRUD operations for objectives and key results
 */

export type ObjectiveCategory = 'career' | 'health' | 'relationships' | 'skills' | 'financial' | 'personal';
export type ObjectiveStatus = 'active' | 'completed' | 'archived' | 'abandoned';
export type KeyResultStatus = 'not_started' | 'in_progress' | 'completed' | 'at_risk';

export interface KeyResult {
  id: string;
  objectiveId: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  completionPercentage: number;
  status: KeyResultStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: ObjectiveCategory;
  targetDate: string;
  status: ObjectiveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectiveWithKeyResults extends Objective {
  keyResults: KeyResult[];
}

export interface CreateObjectiveRequest {
  title: string;
  description?: string;
  category: ObjectiveCategory;
  targetDate: string;
  keyResults: Array<{
    description: string;
    targetValue: number;
    unit: string;
    deadline: string;
  }>;
}

export interface UpdateObjectiveRequest {
  title?: string;
  description?: string;
  category?: ObjectiveCategory;
  targetDate?: string;
  status?: ObjectiveStatus;
}

export interface ObjectivesFilters {
  category?: ObjectiveCategory;
  status?: ObjectiveStatus;
}

/**
 * Get all objectives for current user
 */
export async function getObjectives(filters?: ObjectivesFilters): Promise<ObjectiveWithKeyResults[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);

  const response = await api.get<{ objectives: ObjectiveWithKeyResults[]; count: number }>(
    `/objectives?${params.toString()}`
  );
  return response.data.objectives;
}

/**
 * Get objective by ID
 */
export async function getObjective(id: string): Promise<ObjectiveWithKeyResults> {
  const response = await api.get<ObjectiveWithKeyResults>(`/objectives/${id}`);
  return response.data;
}

/**
 * Create new objective with key results
 */
export async function createObjective(data: CreateObjectiveRequest): Promise<ObjectiveWithKeyResults> {
  const response = await api.post<ObjectiveWithKeyResults>('/objectives', data);
  return response.data;
}

/**
 * Update objective
 */
export async function updateObjective(
  id: string,
  data: UpdateObjectiveRequest
): Promise<Objective> {
  const response = await api.put<Objective>(`/objectives/${id}`, data);
  return response.data;
}

/**
 * Delete objective
 */
export async function deleteObjective(id: string): Promise<void> {
  await api.delete(`/objectives/${id}`);
}

/**
 * Get category display name
 */
export function getCategoryLabel(category: ObjectiveCategory): string {
  const labels: Record<ObjectiveCategory, string> = {
    career: 'Career',
    health: 'Health',
    relationships: 'Relationships',
    skills: 'Skills',
    financial: 'Financial',
    personal: 'Personal',
  };
  return labels[category];
}

/**
 * Get status display name
 */
export function getStatusLabel(status: ObjectiveStatus): string {
  const labels: Record<ObjectiveStatus, string> = {
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
    abandoned: 'Abandoned',
  };
  return labels[status];
}

/**
 * Get key result status label
 */
export function getKeyResultStatusLabel(status: KeyResultStatus): string {
  const labels: Record<KeyResultStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
    at_risk: 'At Risk',
  };
  return labels[status];
}
