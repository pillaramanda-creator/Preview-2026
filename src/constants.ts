import { TaskStatus, TaskType } from './types';
import type { ProjectData } from './types';

const TODAY = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const INITIAL_TEAM = [
  { id: 'u1', name: 'Alice Chen', role: 'Project Manager', avatar: 'https://ui-avatars.com/api/?name=Alice+Chen&background=0021A5&color=fff', timeOff: [formatDate(addDays(TODAY, 5))] },
  { id: 'u2', name: 'Bob Smith', role: 'Frontend Dev', avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=FA4616&color=fff', timeOff: [] },
  { id: 'u3', name: 'Charlie Kim', role: 'Backend Dev', avatar: 'https://ui-avatars.com/api/?name=Charlie+Kim&background=22884C&color=fff', timeOff: [formatDate(addDays(TODAY, 10)), formatDate(addDays(TODAY, 11))] },
  { id: 'u4', name: 'Diana Prince', role: 'Designer', avatar: 'https://ui-avatars.com/api/?name=Diana+Prince&background=6C5EF5&color=fff', timeOff: [] },
];

export const INITIAL_DATA: ProjectData = {
  team: INITIAL_TEAM,
  holidays: [
    formatDate(addDays(TODAY, 14)), // University Holiday example
  ],
  tasks: [
    // Group 1: Planning
    {
      id: 't_planning',
      name: 'Phase 1: Planning',
      assigneeId: 'u1',
      startDate: formatDate(TODAY),
      endDate: formatDate(addDays(TODAY, 3)),
      duration: 3,
      status: TaskStatus.COMPLETED,
      type: TaskType.TASK,
      dependencies: [],
      progress: 100,
      projectedHours: 10,
      actualHours: 10,
      parentId: null
    },
    {
      id: 't1',
      name: 'Project Kickoff',
      assigneeId: 'u1',
      startDate: formatDate(TODAY),
      endDate: formatDate(TODAY),
      duration: 1,
      status: TaskStatus.COMPLETED,
      type: TaskType.MILESTONE,
      dependencies: [],
      progress: 100,
      projectedHours: 2,
      actualHours: 2,
      parentId: 't_planning'
    },
    {
      id: 't2',
      name: 'Requirements Gathering',
      assigneeId: 'u1',
      startDate: formatDate(addDays(TODAY, 1)),
      endDate: formatDate(addDays(TODAY, 3)),
      duration: 3,
      status: TaskStatus.COMPLETED,
      type: TaskType.SUBTASK,
      dependencies: ['t1'],
      progress: 100,
      projectedHours: 20,
      actualHours: 24,
      parentId: 't_planning'
    },
    // Group 2: Design & Backend
    {
      id: 't_dev_phase',
      name: 'Phase 2: Core Development',
      assigneeId: null,
      startDate: formatDate(addDays(TODAY, 4)),
      endDate: formatDate(addDays(TODAY, 12)),
      duration: 8,
      status: TaskStatus.IN_PROGRESS,
      type: TaskType.TASK,
      dependencies: [],
      progress: 40,
      projectedHours: 0,
      actualHours: 0,
      parentId: null
    },
    {
      id: 't3',
      name: 'Design System Mockups',
      assigneeId: 'u4',
      startDate: formatDate(addDays(TODAY, 4)),
      endDate: formatDate(addDays(TODAY, 8)),
      duration: 5,
      status: TaskStatus.IN_PROGRESS,
      type: TaskType.SUBTASK,
      dependencies: ['t2'],
      progress: 60,
      projectedHours: 40,
      actualHours: 20,
      parentId: 't_dev_phase'
    },
    {
      id: 't4',
      name: 'Database Schema',
      assigneeId: 'u3',
      startDate: formatDate(addDays(TODAY, 4)),
      endDate: formatDate(addDays(TODAY, 6)),
      duration: 3,
      status: TaskStatus.IN_PROGRESS,
      type: TaskType.SUBTASK,
      dependencies: ['t2'],
      progress: 80,
      projectedHours: 16,
      actualHours: 12,
      parentId: 't_dev_phase'
    },
    {
      id: 't5',
      name: 'API Development',
      assigneeId: 'u3',
      startDate: formatDate(addDays(TODAY, 7)),
      endDate: formatDate(addDays(TODAY, 12)),
      duration: 6,
      status: TaskStatus.TODO,
      type: TaskType.SUBTASK,
      dependencies: ['t4'],
      progress: 0,
      projectedHours: 48,
      actualHours: 0,
      parentId: 't_dev_phase'
    },
    // Group 3: Frontend & Launch
    {
      id: 't_fe_phase',
      name: 'Phase 3: Frontend & Launch',
      assigneeId: null,
      startDate: formatDate(addDays(TODAY, 9)),
      endDate: formatDate(addDays(TODAY, 16)),
      duration: 7,
      status: TaskStatus.TODO,
      type: TaskType.TASK,
      dependencies: [],
      progress: 0,
      projectedHours: 0,
      actualHours: 0,
      parentId: null
    },
    {
      id: 't6',
      name: 'Frontend Implementation',
      assigneeId: 'u2',
      startDate: formatDate(addDays(TODAY, 9)),
      endDate: formatDate(addDays(TODAY, 15)),
      duration: 7,
      status: TaskStatus.TODO,
      type: TaskType.SUBTASK,
      dependencies: ['t3', 't5'],
      progress: 0,
      projectedHours: 56,
      actualHours: 0,
      parentId: 't_fe_phase'
    },
    {
      id: 't7',
      name: 'Beta Launch',
      assigneeId: 'u1',
      startDate: formatDate(addDays(TODAY, 16)),
      endDate: formatDate(addDays(TODAY, 16)),
      duration: 1,
      status: TaskStatus.TODO,
      type: TaskType.MILESTONE,
      dependencies: ['t6'],
      progress: 0,
      projectedHours: 0,
      actualHours: 0,
      parentId: 't_fe_phase'
    },
  ],
  notes: [
    {
      id: 'n1',
      content: 'Requirements gathering took 1 day longer than expected due to stakeholder unavailability.',
      timestamp: formatDate(addDays(TODAY, 3)),
      author: 'Alice Chen',
      type: 'missed_deadline',
    },
    {
      id: 'n2',
      content: 'Emailed Diana about the color palette update. Still waiting for response.',
      timestamp: formatDate(addDays(TODAY, 5)),
      author: 'Bob Smith',
      type: 'communication',
    },
    {
      id: 'n3',
      content: 'Charlie requested time off next week, might impact API delivery.',
      timestamp: formatDate(TODAY),
      author: 'Alice Chen',
      type: 'risk',
    },
  ],
};