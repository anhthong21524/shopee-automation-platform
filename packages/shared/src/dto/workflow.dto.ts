import { PostTone } from '../types/workflow.types';

export interface WorkflowRequest {
  keyword: string;
  limit?: number;
  tone?: PostTone;
}
