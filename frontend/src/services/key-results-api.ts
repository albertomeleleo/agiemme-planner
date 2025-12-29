import api from './api';
import { KeyResult, KeyResultStatus } from './objectives-api';

/**
 * Key Results API Service
 * Handles key result updates and progress tracking
 */

export interface ProgressUpdate {
  id: string;
  keyResultId: string;
  valueRecorded: number;
  notes: string | null;
  recordedAt: string;
}

export interface KeyResultWithProgress extends KeyResult {
  progressHistory: ProgressUpdate[];
}

export interface UpdateKeyResultRequest {
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: string;
}

export interface RecordProgressRequest {
  valueRecorded: number;
  notes?: string;
}

export interface ProgressTrendPoint {
  date: string;
  value: number;
  percentage: number;
}

export interface TrendData {
  keyResultId: string;
  targetValue: number;
  unit: string;
  trendData: ProgressTrendPoint[];
}

/**
 * Get key result with progress history
 */
export async function getKeyResult(
  id: string,
  options?: { startDate?: string; endDate?: string }
): Promise<KeyResultWithProgress> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const response = await api.get<KeyResultWithProgress>(
    `/key-results/${id}?${params.toString()}`
  );
  return response.data;
}

/**
 * Update key result
 */
export async function updateKeyResult(
  id: string,
  data: UpdateKeyResultRequest
): Promise<KeyResult> {
  const response = await api.put<KeyResult>(`/key-results/${id}`, data);
  return response.data;
}

/**
 * Delete key result
 */
export async function deleteKeyResult(id: string): Promise<void> {
  await api.delete(`/key-results/${id}`);
}

/**
 * Record progress update
 */
export async function recordProgress(
  keyResultId: string,
  data: RecordProgressRequest
): Promise<{ progressUpdate: ProgressUpdate; keyResult: KeyResult }> {
  const response = await api.post<{ progressUpdate: ProgressUpdate; keyResult: KeyResult }>(
    `/key-results/${keyResultId}/progress`,
    data
  );
  return response.data;
}

/**
 * Get progress trend data
 */
export async function getProgressTrend(
  keyResultId: string,
  options?: { startDate?: string; endDate?: string }
): Promise<TrendData> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const response = await api.get<TrendData>(
    `/key-results/${keyResultId}/trend?${params.toString()}`
  );
  return response.data;
}

/**
 * Get at-risk key results for current user
 */
export async function getAtRiskKeyResults(): Promise<KeyResult[]> {
  const response = await api.get<{ keyResults: KeyResult[]; count: number }>('/key-results/at-risk');
  return response.data.keyResults;
}

/**
 * Calculate days remaining until deadline
 */
export function getDaysUntilDeadline(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get status color for Chakra UI
 */
export function getStatusColor(status: KeyResultStatus): string {
  const colors: Record<KeyResultStatus, string> = {
    not_started: 'gray',
    in_progress: 'blue',
    completed: 'green',
    at_risk: 'red',
  };
  return colors[status];
}
