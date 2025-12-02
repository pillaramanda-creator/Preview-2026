import React, { useState, useEffect } from 'react';
import type { Task, TeamMember } from '../types';
import { TaskType, TaskStatus } from '../types';
import { X, Calendar as CalendarIcon, Clock, FolderTree } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  task: Task | null;
  team: TeamMember[];
  allTasks: Task[];
  readOnly?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, onDelete, task, team, allTasks, readOnly }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    name: '',
    status: TaskStatus.TODO,
    type: TaskType.TASK,
    progress: 0,
    dependencies: [],
    projectedHours: 0,
    actualHours: 0,
    parentId: null
  });

  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    } else {
      // Default for new task
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        duration: 1,
        progress: 0,
        dependencies: [],
        assigneeId: '',
        projectedHours: 0,
        actualHours: 0,
        parentId: null
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly && formData.name && formData.startDate && formData.endDate) {
      onSave(formData as Task);
      onClose();
    }
  };

  const handleDependencyChange = (depId: string) => {
    if (readOnly) return;
    const currentDeps = formData.dependencies || [];
    if (currentDeps.includes(depId)) {
      setFormData({ ...formData, dependencies: currentDeps.filter(d => d !== depId) });
    } else {
      setFormData({ ...formData, dependencies: [...currentDeps, depId] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {readOnly ? 'Task Details' : (task ? 'Edit Task' : 'Create New Task')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <form id="taskForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  disabled={readOnly}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] focus:border-[#0021A5] outline-none transition-all bg-white text-slate-900 disabled:bg-slate-100"
                  placeholder="e.g. Design Homepage"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <FolderTree size={14} className="text-gray-400"/> Parent Task Group
                </label>
                <select
                    value={formData.parentId || ''}
                    disabled={readOnly}
                    onChange={e => setFormData({ ...formData, parentId: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 disabled:bg-slate-100"
                >
                    <option value="">(None - Top Level Task)</option>
                    {allTasks
                        .filter(t => t.id !== formData.id && !t.parentId) // Only show potential parents, avoid cycles or multi-level depth for simplicity
                        .map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                {!readOnly && <p className="text-xs text-gray-500 mt-1">Group this task under a parent task to inherit its color coding.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  disabled={readOnly}
                  onChange={e => setFormData({ ...formData, type: e.target.value as TaskType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 disabled:bg-slate-100"
                >
                  <option value={TaskType.TASK}>Task</option>
                  <option value={TaskType.SUBTASK}>Subtask</option>
                  <option value={TaskType.MILESTONE}>Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  disabled={readOnly}
                  onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 disabled:bg-slate-100"
                >
                  {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    disabled={readOnly}
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 disabled:bg-slate-100"
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    disabled={readOnly}
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 disabled:bg-slate-100"
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                   Projected Hours <Clock size={14} className="text-gray-400"/>
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={readOnly}
                  value={formData.projectedHours}
                  onChange={e => setFormData({ ...formData, projectedHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                   Actual Hours <Clock size={14} className="text-gray-400"/>
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={readOnly}
                  value={formData.actualHours}
                  onChange={e => setFormData({ ...formData, actualHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 disabled:bg-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {team.map(member => (
                    <div
                      key={member.id}
                      onClick={() => !readOnly && setFormData({ ...formData, assigneeId: formData.assigneeId === member.id ? null : member.id })}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all bg-white ${!readOnly ? 'cursor-pointer' : ''} ${
                        formData.assigneeId === member.id 
                          ? 'border-[#0021A5] bg-blue-50 ring-1 ring-[#0021A5]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                      <span className="text-sm truncate">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Dependencies</label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2 bg-white">
                  {allTasks.filter(t => t.id !== formData.id).map(t => (
                    <label key={t.id} className={`flex items-center gap-2 text-sm text-slate-700 p-1.5 rounded transition-colors ${!readOnly ? 'cursor-pointer hover:bg-slate-50' : ''}`}>
                      <input 
                        type="checkbox"
                        disabled={readOnly}
                        checked={formData.dependencies?.includes(t.id)}
                        onChange={() => handleDependencyChange(t.id)}
                        className="rounded text-[#0021A5] focus:ring-[#0021A5]"
                      />
                      <span className="truncate">{t.name}</span>
                    </label>
                  ))}
                  {allTasks.length <= 1 && <p className="text-xs text-gray-400 italic">No other tasks available</p>}
                </div>
              </div>
              
               <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  disabled={readOnly}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none resize-none bg-white text-slate-900 disabled:bg-slate-100"
                  rows={3}
                  placeholder="Additional task details..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-slate-50">
          {!readOnly && task ? (
             <button 
             type="button"
             onClick={() => {
               if(window.confirm('Are you sure you want to delete this task?')) {
                 onDelete(task.id);
                 onClose();
               }
             }}
             className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
           >
             Delete Task
           </button>
          ) : <div></div>}
         
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors bg-white border border-gray-200 shadow-sm"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
                <button 
                type="submit" 
                form="taskForm"
                className="px-6 py-2 bg-[#0021A5] text-white font-medium rounded-lg hover:bg-[#001b87] shadow-md shadow-blue-200 transition-all transform hover:scale-105"
                >
                {task ? 'Save Changes' : 'Create Task'}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};