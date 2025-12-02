export type ViewMode = 'gantt' | 'table' | 'calendar';

// FIX: Convert enum to const object for erasableSyntaxOnly
export const TaskType = {
  TASK: 'Task',
  SUBTASK: 'Subtask',
  MILESTONE: 'Milestone',
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

// FIX: Convert enum to const object for erasableSyntaxOnly
export const TaskStatus = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  timeOff: string[]; // ISO Date strings
}

export interface Task {
  id: string;
  name: string;
  parentId?: string | null; // For grouping
  assigneeId: string | null;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  duration: number; // days
  status: TaskStatus;
  type: TaskType;
  dependencies: string[]; // IDs of tasks this task depends on
  progress: number; // 0-100
  description?: string;
  projectedHours: number;
  actualHours: number;
}

export interface Note {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  type: 'general' | 'missed_deadline' | 'communication' | 'risk';
}

export interface AISummary {
  summary: string;
  risks: string[];
  mitigations: string[];
}

export interface ProjectData {
  tasks: Task[];
  team: TeamMember[];
  notes: Note[];
  holidays: string[]; // ISO Date strings
  lastAnalysis?: AISummary; // Persist summary for sharing
}