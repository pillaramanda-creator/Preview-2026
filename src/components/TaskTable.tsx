import React, { useState } from 'react';
import type { ProjectData, Task } from '../types';
import { TaskStatus, TaskType } from '../types';
import { Pencil, Trash2, Plus, GitMerge, FolderTree, GripVertical } from 'lucide-react';

interface TaskTableProps {
  data: ProjectData;
  onUpdateTask: (taskId: string, field: string, value: any) => void;
  onAddTask: () => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: any) => void;
  onReorderTasks: (tasks: Task[]) => void;
  readOnly?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({ 
  data, 
  onUpdateTask, 
  onAddTask, 
  onDeleteTask, 
  onEditTask,
  onReorderTasks,
  readOnly
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Helper to determine root group for coloring
  const getPhaseIndex = (task: Task, allTasks: Task[]) => {
    let current = task;
    while (current.parentId) {
      const parent = allTasks.find(t => t.id === current.parentId);
      if (parent) {
        current = parent;
      } else {
        break;
      }
    }
    const roots = allTasks.filter(t => !t.parentId).map(t => t.id);
    return roots.indexOf(current.id);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (readOnly) return;
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (readOnly || !draggedTaskId || draggedTaskId === targetTaskId) return;

    const sourceIndex = data.tasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = data.tasks.findIndex(t => t.id === targetTaskId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newTasks = [...data.tasks];
    const [movedTask] = newTasks.splice(sourceIndex, 1);
    newTasks.splice(targetIndex, 0, movedTask);

    onReorderTasks(newTasks);
    setDraggedTaskId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="overflow-auto flex-1 bg-slate-50/50">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-2 py-3 w-8"></th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Task Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[12%]">Parent Group</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[8%]">Type</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Assignee</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[8%]">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[12%]">Timeline</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[6%] text-center">Proj.</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[6%] text-center">Act.</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[8%]">Dependencies</th>
              {!readOnly && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.tasks.map((task, index) => {
              const assignee = data.team.find(u => u.id === task.assigneeId);
              const dependencies = task.dependencies
                .map(depId => data.tasks.find(t => t.id === depId)?.name)
                .filter(Boolean)
                .join(', ');

              const hoursDiff = task.actualHours - task.projectedHours;
              const hoursColor = hoursDiff > 0 ? 'text-[#FA4616]' : hoursDiff < 0 ? 'text-[#22884C]' : 'text-slate-700';
              const phaseIndex = getPhaseIndex(task, data.tasks);
              const rowBgClass = phaseIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50';

              return (
                <tr 
                  key={task.id} 
                  className={`${rowBgClass} hover:bg-blue-50/50 transition-colors group relative`}
                  draggable={!readOnly}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, task.id)}
                >
                  <td className="px-2 py-3 text-center text-gray-300">
                    {!readOnly && <GripVertical size={16} className="cursor-move hover:text-gray-500" />}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {task.parentId && <div className="w-3 h-3 border-l border-b border-gray-300 mr-2 rounded-bl-sm opacity-50" />}
                      <input 
                        type="text" 
                        value={task.name}
                        disabled={readOnly}
                        onChange={(e) => onUpdateTask(task.id, 'name', e.target.value)}
                        className={`w-full bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-[#0021A5]/30 rounded px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-[#0021A5]/10 outline-none transition-all disabled:hover:border-transparent ${
                          task.type === TaskType.MILESTONE ? 'text-[#FA4616]' : 'text-slate-700'
                        } ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-400' : ''}`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        value={task.parentId || ''}
                        disabled={readOnly}
                        onChange={(e) => onUpdateTask(task.id, 'parentId', e.target.value || null)}
                        className="w-full text-xs border border-transparent hover:border-gray-200 bg-transparent focus:bg-white rounded px-2 py-1.5 focus:ring-2 focus:ring-[#0021A5]/10 outline-none text-slate-600 pl-7 disabled:hover:border-transparent appearance-none"
                      >
                        <option value="">(None)</option>
                        {data.tasks.filter(t => t.id !== task.id && !t.parentId).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <FolderTree size={12} className="absolute left-2 top-2 text-gray-400 pointer-events-none"/>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.type}
                      disabled={readOnly}
                      onChange={(e) => onUpdateTask(task.id, 'type', e.target.value)}
                      className={`text-xs border border-gray-200 bg-white rounded-md px-2 py-1.5 font-medium cursor-pointer focus:ring-2 focus:ring-[#0021A5]/10 outline-none shadow-sm w-full disabled:cursor-default ${
                        task.type === TaskType.MILESTONE ? 'bg-orange-50 text-[#FA4616] border-orange-200' : 
                        task.type === TaskType.SUBTASK ? 'bg-blue-50 text-[#0021A5] border-blue-200' : 'bg-white text-slate-700'
                      }`}
                    >
                      <option value={TaskType.TASK}>Task</option>
                      <option value={TaskType.SUBTASK}>Subtask</option>
                      <option value={TaskType.MILESTONE}>Milestone</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.assigneeId || ''}
                      disabled={readOnly}
                      onChange={(e) => onUpdateTask(task.id, 'assigneeId', e.target.value || null)}
                      className="w-full text-xs border border-transparent hover:border-gray-200 bg-transparent focus:bg-white rounded px-2 py-1.5 focus:ring-2 focus:ring-[#0021A5]/10 focus:border-[#0021A5]/30 outline-none text-slate-700 disabled:hover:border-transparent appearance-none"
                    >
                      <option value="">Unassigned</option>
                      {data.team.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                     <select 
                      value={task.status}
                      disabled={readOnly}
                      onChange={(e) => onUpdateTask(task.id, 'status', e.target.value)}
                      className={`text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0021A5]/10 focus:border-[#0021A5]/30 p-1.5 w-full bg-white shadow-sm font-medium disabled:cursor-default ${
                        task.status === TaskStatus.COMPLETED ? 'text-[#22884C] bg-green-50 border-green-200' : 'text-slate-700'
                      }`}
                    >
                      {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <input 
                        type="date" 
                        value={task.startDate}
                        disabled={readOnly}
                        onChange={(e) => onUpdateTask(task.id, 'startDate', e.target.value)}
                        className="text-xs border border-transparent hover:border-gray-200 rounded px-1.5 py-1 bg-transparent focus:bg-white text-gray-600 focus:ring-2 focus:ring-[#0021A5]/10 focus:border-[#0021A5]/30 outline-none w-full disabled:hover:border-transparent"
                      />
                      <input 
                        type="date" 
                        value={task.endDate}
                        disabled={readOnly}
                        onChange={(e) => onUpdateTask(task.id, 'endDate', e.target.value)}
                        className="text-xs border border-transparent hover:border-gray-200 rounded px-1.5 py-1 bg-transparent focus:bg-white text-gray-600 focus:ring-2 focus:ring-[#0021A5]/10 focus:border-[#0021A5]/30 outline-none w-full disabled:hover:border-transparent"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number"
                      value={task.projectedHours}
                      disabled={readOnly}
                      onChange={(e) => onUpdateTask(task.id, 'projectedHours', parseInt(e.target.value) || 0)}
                      className="w-full text-center text-xs bg-white border border-gray-200 rounded-md py-1.5 shadow-sm focus:ring-2 focus:ring-[#0021A5]/10 focus:border-[#0021A5]/30 outline-none font-medium text-slate-700 disabled:bg-transparent disabled:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                     <input 
                        type="number"
                        value={task.actualHours}
                        disabled={readOnly}
                        onChange={(e) => onUpdateTask(task.id, 'actualHours', parseInt(e.target.value) || 0)}
                        className={`w-full text-center text-xs bg-white border border-gray-200 rounded-md py-1.5 shadow-sm focus:ring-2 focus:ring-[#0021A5]/10 focus:border-[#0021A5]/30 outline-none font-medium disabled:bg-transparent disabled:border-transparent ${hoursColor}`}
                      />
                  </td>
                  <td className="px-4 py-3">
                     <div className="flex items-center text-xs text-gray-500 bg-white/50 border border-gray-100 rounded px-2 py-1.5 max-w-[120px]" title={dependencies}>
                       {dependencies ? (
                         <>
                           <GitMerge size={12} className="mr-1 text-gray-400 flex-shrink-0" />
                           <span className="truncate">{dependencies}</span>
                         </>
                       ) : (
                         <span className="text-gray-300 italic pl-1">None</span>
                       )}
                     </div>
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditTask(task)} className="bg-white border border-gray-200 shadow-sm rounded p-1.5 text-[#0021A5] hover:bg-blue-50 transition-colors">
                            <Pencil size={14} />
                        </button>
                        <button onClick={() => onDeleteTask(task.id)} className="bg-white border border-gray-200 shadow-sm rounded p-1.5 text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                        </button>
                        </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer Add Button */}
      {!readOnly && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
            <button 
            onClick={onAddTask}
            className="flex items-center gap-2 text-sm font-medium text-[#0021A5] hover:text-[#001b87] px-4 py-2.5 rounded-md bg-white border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all w-full justify-center"
            >
            <Plus size={16} /> Add New Task
            </button>
        </div>
      )}
    </div>
  );
};