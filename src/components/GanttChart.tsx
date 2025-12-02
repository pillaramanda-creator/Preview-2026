import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { ProjectData } from '../types';
import { TaskType } from '../types';

interface GanttChartProps {
  data: ProjectData;
  onTaskDateChange?: (taskId: string, newStartDate: string, newEndDate: string) => void;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
}

const DAY_WIDTH = 50;
const HEADER_HEIGHT = 60;
const ROW_HEIGHT = 48;
const SIDEBAR_WIDTH = 280;

// UF Brand Colors
const GROUP_COLORS = [
  '#0021A5', // Core Blue
  '#FA4616', // Core Orange
  '#22884C', // Gator Green
  '#53565A', // Cool Gray 11 (Dark)
  '#6C5EF5', // Violet (Complementary)
  '#005796', // Darker Blue variant
  '#F37021', // Lighter Orange variant
  '#A4D65E', // Botany (Light Green)
];

export const GanttChart: React.FC<GanttChartProps> = ({ data, onTaskDateChange, exportRef, readOnly }) => {
  // --- Drag and Drop State ---
  const [dragState, setDragState] = useState<{
    taskId: string;
    mode: 'move' | 'resize';
    startX: number;
    initialStart: Date;
    initialEnd: Date;
    currentXDiff: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Process Data for Hierarchy & Colors ---
  const { sortedTasks, taskColors } = useMemo(() => {
    // 1. Identify Root Tasks (Parents)
    const roots = data.tasks.filter(t => !t.parentId);
    const resultTasks: typeof data.tasks = [];
    const colors: Record<string, string> = {};

    roots.forEach((root, index) => {
      // Assign color to root
      const color = GROUP_COLORS[index % GROUP_COLORS.length];
      colors[root.id] = color;
      
      resultTasks.push(root);

      // Find children
      const children = data.tasks.filter(t => t.parentId === root.id);
      children.forEach(child => {
        colors[child.id] = color; // Inherit color
        resultTasks.push(child);
      });
    });

    // Add any orphans at the end (fallback)
    const processedIds = new Set(resultTasks.map(t => t.id));
    const orphans = data.tasks.filter(t => !processedIds.has(t.id));
    orphans.forEach(t => {
       colors[t.id] = '#94a3b8'; // Default grey
       resultTasks.push(t);
    });

    return { sortedTasks: resultTasks, taskColors: colors };
  }, [data.tasks]);


  // --- Timeline Calculation ---
  const timeline = useMemo(() => {
    if (data.tasks.length === 0) return { start: new Date(), end: new Date(), days: [] };

    const startDates = data.tasks.map(t => new Date(t.startDate).getTime());
    const endDates = data.tasks.map(t => new Date(t.endDate).getTime());
    
    const minDate = new Date(Math.min(...startDates));
    minDate.setDate(minDate.getDate() - 5); // Buffer
    const maxDate = new Date(Math.max(...endDates));
    maxDate.setDate(maxDate.getDate() + 15); // Buffer

    const days = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return { start: minDate, end: maxDate, days };
  }, [data.tasks]);

  // --- Helpers ---
  const getXForDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffTime = date.getTime() - timeline.start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays * DAY_WIDTH;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isHoliday = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return data.holidays.includes(dStr);
  };

  const getDayDiff = (d1: string, d2: string) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  // --- Handlers ---

  const handleMouseDown = (e: React.MouseEvent, taskId: string, mode: 'move' | 'resize') => {
    if (readOnly) return; // Disable interaction
    e.preventDefault();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return;

    setDragState({
      taskId,
      mode,
      startX: e.clientX,
      initialStart: new Date(task.startDate),
      initialEnd: new Date(task.endDate),
      currentXDiff: 0
    });
  };

  useEffect(() => {
    if (readOnly) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;
      const diff = e.clientX - dragState.startX;
      setDragState(prev => prev ? ({ ...prev, currentXDiff: diff }) : null);
    };

    const handleMouseUp = () => {
      if (!dragState || !onTaskDateChange) {
        setDragState(null);
        return;
      }

      // Calculate final dates
      const daysDiff = Math.round(dragState.currentXDiff / DAY_WIDTH);
      
      let newStart = new Date(dragState.initialStart);
      let newEnd = new Date(dragState.initialEnd);

      if (dragState.mode === 'move') {
        newStart.setDate(newStart.getDate() + daysDiff);
        newEnd.setDate(newEnd.getDate() + daysDiff);
      } else {
        newEnd.setDate(newEnd.getDate() + daysDiff);
        // Prevent end before start
        if (newEnd < newStart) newEnd = new Date(newStart);
      }

      onTaskDateChange(
        dragState.taskId,
        newStart.toISOString().split('T')[0],
        newEnd.toISOString().split('T')[0]
      );

      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, onTaskDateChange, readOnly]);


  const chartWidth = timeline.days.length * DAY_WIDTH;
  const chartHeight = sortedTasks.length * ROW_HEIGHT + HEADER_HEIGHT;

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="overflow-auto relative h-full" ref={containerRef}>
        <div ref={exportRef} style={{ width: SIDEBAR_WIDTH + chartWidth, height: chartHeight }}>
          <svg width={SIDEBAR_WIDTH + chartWidth} height={chartHeight} className="block select-none bg-white">
            {/* Sidebar Background */}
            <rect x={0} y={0} width={SIDEBAR_WIDTH} height={chartHeight} fill="#f8fafc" className="border-r border-gray-200" />
            
            {/* Timeline Header */}
            <g transform={`translate(${SIDEBAR_WIDTH}, 0)`}>
              {timeline.days.map((day, i) => (
                <g key={i} transform={`translate(${i * DAY_WIDTH}, 0)`}>
                  <rect width={DAY_WIDTH} height={HEADER_HEIGHT} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
                  <text x={DAY_WIDTH / 2} y={25} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
                    {day.toLocaleDateString('en-US', { month: 'short' })}
                  </text>
                  <text x={DAY_WIDTH / 2} y={45} textAnchor="middle" fontSize="12" fill="#334155">
                    {day.getDate()}
                  </text>
                </g>
              ))}
            </g>

            {/* Grid Body */}
            <g transform={`translate(${SIDEBAR_WIDTH}, ${HEADER_HEIGHT})`}>
              {/* 1. Global Background Grid (Weekends/Holidays) */}
              {timeline.days.map((day, i) => {
                const blackout = isWeekend(day) || isHoliday(day);
                return (
                  <g key={`bg-${i}`}>
                    <rect 
                      x={i * DAY_WIDTH} 
                      y={0} 
                      width={DAY_WIDTH} 
                      height={chartHeight - HEADER_HEIGHT} 
                      fill={blackout ? "#f8fafc" : "white"} 
                      stroke="#f1f5f9"
                    />
                    {isHoliday(day) && (
                      <text 
                          x={i * DAY_WIDTH + DAY_WIDTH/2} 
                          y={20} 
                          className="text-[10px] fill-red-300 select-none opacity-50"
                          style={{writingMode: 'vertical-rl'}}
                        >
                        HOLIDAY
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 2. Staff Specific Time Off (Per Row) */}
              {sortedTasks.map((task, index) => {
                const y = index * ROW_HEIGHT;
                const assignee = data.team.find(u => u.id === task.assigneeId);
                
                if (!assignee || !assignee.timeOff.length) return null;

                return assignee.timeOff.map(offDateStr => {
                  const offDate = new Date(offDateStr);
                  // Check if date is within timeline bounds
                  if (offDate < timeline.start || offDate > timeline.end) return null;
                  
                  const x = getXForDate(offDateStr);
                  return (
                    <g key={`off-${task.id}-${offDateStr}`}>
                      <title>{assignee.name} - Time Off</title>
                      {/* Hatched Pattern Rect */}
                      <rect 
                        x={x} 
                        y={y} 
                        width={DAY_WIDTH} 
                        height={ROW_HEIGHT} 
                        fill="url(#diagonalHatch)" 
                        opacity={0.3}
                      />
                    </g>
                  );
                });
              })}

              {/* 3. Dependency Lines */}
              {sortedTasks.map((task, index) => {
                // Don't draw dependencies if parent group (optional, but cleaner)
                const isParentGroup = sortedTasks.some(t => t.parentId === task.id);
                if (isParentGroup) return null;

                const startX = getXForDate(task.startDate);
                const endX = getXForDate(task.endDate) + (task.type === TaskType.MILESTONE ? 0 : DAY_WIDTH);
                const y = index * ROW_HEIGHT + ROW_HEIGHT / 2;

                return task.dependencies.map(depId => {
                  const depIndex = sortedTasks.findIndex(t => t.id === depId);
                  if (depIndex === -1) return null;
                  const depTask = sortedTasks[depIndex];
                  const depEndX = getXForDate(depTask.endDate) + (depTask.type === TaskType.MILESTONE ? 0 : DAY_WIDTH);
                  const depY = depIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
                  
                  // Simple orthogonal path
                  const path = `M ${depEndX} ${depY} L ${depEndX + 10} ${depY} L ${depEndX + 10} ${y} L ${startX} ${y}`;
                  
                  return (
                    <path 
                      key={`${task.id}-${depId}`} 
                      d={path} 
                      stroke="#94a3b8" 
                      strokeWidth="1.5" 
                      fill="none" 
                      markerEnd="url(#arrowhead)"
                    />
                  );
                });
              })}

              {/* 4. Tasks Bars */}
              {sortedTasks.map((task, index) => {
                // Check if this task is a parent to others
                const isParentGroup = sortedTasks.some(t => t.parentId === task.id);
                
                // If it is a parent group, we SKIP rendering the bar
                if (isParentGroup) return null;

                const isDragging = dragState?.taskId === task.id;
                
                // Base Dates
                let displayStart = task.startDate;
                let displayEnd = task.endDate;

                // Apply drag diff visually
                if (isDragging && dragState) {
                  const diffDays = Math.round(dragState.currentXDiff / DAY_WIDTH);
                  
                  const s = new Date(dragState.initialStart);
                  const e = new Date(dragState.initialEnd);
                  
                  if (dragState.mode === 'move') {
                    s.setDate(s.getDate() + diffDays);
                    e.setDate(e.getDate() + diffDays);
                  } else {
                    e.setDate(e.getDate() + diffDays);
                    if (e < s) e.setTime(s.getTime());
                  }

                  displayStart = s.toISOString().split('T')[0];
                  displayEnd = e.toISOString().split('T')[0];
                }

                const x = getXForDate(displayStart);
                const daysDuration = getDayDiff(displayStart, displayEnd) + 1;
                const w = Math.max(daysDuration * DAY_WIDTH, DAY_WIDTH);
                const y = index * ROW_HEIGHT + (ROW_HEIGHT - 24) / 2;

                const isMilestone = task.type === TaskType.MILESTONE;
                const baseColor = taskColors[task.id];
                const isCompleted = task.status === 'Completed';

                return (
                  <g key={task.id} className={!readOnly ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}>
                    <title>{task.name} ({task.status})</title>
                    {isMilestone ? (
                      <g 
                        transform={`translate(${x}, ${y + 12})`}
                        onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
                      >
                        <polygon points="0,-12 12,0 0,12 -12,0" fill={baseColor} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                      </g>
                    ) : (
                      <g>
                        {/* Main Bar */}
                        <rect 
                          x={x} 
                          y={y} 
                          width={w} 
                          height={24} 
                          rx={4} 
                          fill={baseColor} 
                          opacity={isDragging ? 0.7 : isCompleted ? 0.6 : 0.9}
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
                          className={!readOnly ? "hover:opacity-100 transition-opacity" : ""}
                        />
                        
                        {/* Progress Bar */}
                        <rect 
                          x={x} 
                          y={y + 20} 
                          width={w * (task.progress / 100)} 
                          height={4} 
                          rx={2} 
                          fill="rgba(255,255,255,0.7)" 
                          pointerEvents="none"
                        />

                        {/* Resize Handle (Right Edge) - Only if not read only */}
                        {!readOnly && (
                            <rect 
                            x={x + w - 5}
                            y={y}
                            width={10}
                            height={24}
                            fill="transparent"
                            className="cursor-e-resize hover:bg-black/10"
                            onMouseDown={(e) => handleMouseDown(e, task.id, 'resize')}
                            />
                        )}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Sidebar (Task List) Overlay */}
            <g>
              <rect x={0} y={HEADER_HEIGHT} width={SIDEBAR_WIDTH} height={chartHeight - HEADER_HEIGHT} fill="white" opacity="0.95" />
              {/* Header Separator */}
              <line x1={0} y1={HEADER_HEIGHT} x2={SIDEBAR_WIDTH} y2={HEADER_HEIGHT} stroke="#e2e8f0" />
              <line x1={SIDEBAR_WIDTH} y1={0} x2={SIDEBAR_WIDTH} y2={chartHeight} stroke="#e2e8f0" />
              
              {/* Sidebar Header */}
              <text x={20} y={40} fontWeight="bold" fill="#334155">Task Hierarchy</text>

              {sortedTasks.map((task, index) => {
                const isChild = !!task.parentId;
                const color = taskColors[task.id];
                // Check if this is a parent group to bold it or style differently
                const isParentGroup = sortedTasks.some(t => t.parentId === task.id);

                return (
                  <g key={`label-${task.id}`} transform={`translate(0, ${HEADER_HEIGHT + index * ROW_HEIGHT})`}>
                    <line x1={0} y1={ROW_HEIGHT} x2={SIDEBAR_WIDTH} y2={ROW_HEIGHT} stroke="#f1f5f9" />
                    
                    {/* Color Strip Indicator */}
                    <rect x={0} y={0} width={4} height={ROW_HEIGHT} fill={color} />
                    
                    <text 
                      x={isChild ? 40 : 15} 
                      y={30} 
                      fontSize={isParentGroup ? "14" : "13"} 
                      fill={isParentGroup ? "#1e293b" : "#334155"} 
                      fontWeight={isParentGroup ? '800' : (isChild ? 'normal' : 'bold')}
                      style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', opacity: task.status === 'Completed' ? 0.6 : 1 }}
                    >
                      {task.name}
                    </text>
                    {/* Assignee Avatar */}
                    {task.assigneeId && (
                      <image 
                        href={data.team.find(u => u.id === task.assigneeId)?.avatar} 
                        x={SIDEBAR_WIDTH - 40} 
                        y={8} 
                        height={32} 
                        width={32} 
                        style={{ clipPath: 'circle(16px)' }}
                        className="rounded-full"
                      />
                    )}
                  </g>
                );
              })}
            </g>
            
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
              <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" style={{stroke:'#FA4616', strokeWidth:2}} />
              </pattern>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};