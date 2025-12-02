import React, { useState } from 'react';
import type { ProjectData } from '../types';
import { TaskStatus } from '../types';
import { Calendar as CalendarIcon, ArrowRight, ChevronLeft, ChevronRight, Palmtree } from 'lucide-react';

interface CalendarViewProps {
  data: ProjectData;
  onEditTask: (task: any) => void;
  readOnly?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ data, onEditTask, readOnly }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = [];
  // Pad empty days
  for(let i=0; i<startDay; i++) days.push(null);
  // Fill days
  for(let i=1; i<=daysInMonth; i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));

  const getTasksForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return data.tasks.filter(t => t.endDate === dStr);
  };

  const isHoliday = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return data.holidays.includes(dStr);
  };

  const handleTaskClick = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    if (selectedTaskId === task.id) {
      // Second click opens full details
      onEditTask(task);
      setSelectedTaskId(null);
    } else {
      // First click shows summary popover
      setSelectedTaskId(task.id);
    }
  };

  // Check if a date is "today" (real time)
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 h-full flex flex-col" onClick={() => setSelectedTaskId(null)}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 min-w-[200px]">
             <CalendarIcon className="text-[#FA4616]" />
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
            >
              Today
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Click task to view info{readOnly ? '' : ', click again to edit'}.
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex-1 min-h-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-slate-50 p-2 text-center text-xs font-bold text-gray-500 uppercase">
            {d}
          </div>
        ))}

        {days.map((date, idx) => {
           if (!date) return <div key={`empty-${idx}`} className="bg-white" />;
           
           const tasksDue = getTasksForDate(date);
           const todayHighlight = isToday(date);
           const holiday = isHoliday(date);

           return (
             <div key={idx} className={`p-2 hover:bg-slate-50 transition-colors flex flex-col min-h-[100px] relative 
               ${holiday ? 'bg-orange-50/30' : 'bg-white'} 
               ${todayHighlight ? 'bg-blue-50/30' : ''}`
             }>
               <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${todayHighlight ? 'text-[#0021A5] bg-blue-100 w-7 h-7 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </span>
                  {holiday && (
                    <span title="University Holiday" className="text-[#FA4616]">
                      <Palmtree size={14} />
                    </span>
                  )}
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                 {holiday && (
                   <div className="text-[10px] font-bold text-[#FA4616] uppercase tracking-wider mb-1">Holiday</div>
                 )}
                 {tasksDue.map(task => {
                   const assignee = data.team.find(u => u.id === task.assigneeId);
                   const isSelected = selectedTaskId === task.id;

                   return (
                     <div key={task.id} className="relative">
                        {/* Task Pill */}
                        <div 
                          onClick={(e) => handleTaskClick(e, task)}
                          className={`text-xs p-1.5 rounded border-l-2 shadow-sm cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-[#0021A5] text-white border-[#001b87] ring-2 ring-blue-200 z-10' 
                              : 'bg-white border-[#0021A5] hover:bg-blue-50 text-slate-700'
                          }`}
                        >
                            <div className="truncate font-medium">{task.name}</div>
                            {assignee && !isSelected && (
                                <div className="flex items-center gap-1 mt-1 opacity-75">
                                    <img src={assignee.avatar} className="w-3 h-3 rounded-full"/>
                                    <span className="text-[10px]">{assignee.name.split(' ')[0]}</span>
                                </div>
                            )}
                        </div>

                        {/* Hover/Select Popover */}
                        {isSelected && (
                          <div className="absolute left-full top-0 ml-2 z-50 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-fade-in text-left">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800 text-sm leading-tight">{task.name}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-[#22884C]' : 'bg-blue-100 text-[#0021A5]'
                              }`}>
                                {task.status}
                              </span>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                               <div className="flex items-center gap-2 text-xs text-gray-600">
                                 <CalendarIcon size={12} />
                                 <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                               </div>
                               {assignee && (
                                 <div className="flex items-center gap-2 text-xs text-gray-600">
                                   <img src={assignee.avatar} className="w-4 h-4 rounded-full"/>
                                   <span>{assignee.name}</span>
                                 </div>
                               )}
                            </div>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(task);
                              }}
                              className="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              {readOnly ? 'View Details' : 'Edit Details'} <ArrowRight size={12} />
                            </button>
                            
                            {/* Arrow Pointer */}
                            <div className="absolute right-full top-3 -mr-1 w-2 h-2 bg-white transform rotate-45 border-l border-b border-gray-100"></div>
                          </div>
                        )}
                     </div>
                   );
                 })}
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};