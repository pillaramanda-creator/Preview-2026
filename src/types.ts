export type ViewMode = 'gantt' | 'table' | 'calendar';

// Value (const object)
export const TaskType = {
  TASK: 'Task',
  SUBTASK: 'Subtask',
  MILESTONE: 'Milestone',
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

// Value (const object)
export const TaskStatus = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

// Types (Interfaces)
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  timeOff: string[];
}

export interface Task {
  id: string;
  name: string;
  parentId?: string | null;
  assigneeId: string | null;
  startDate: string;
  endDate: string;
  duration: number;
  status: TaskStatus;
  type: TaskType;
  dependencies: string[];
  progress: number;
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
  holidays: string[];
  lastAnalysis?: AISummary;
}