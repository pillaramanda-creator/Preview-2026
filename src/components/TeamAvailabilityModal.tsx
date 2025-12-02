import React, { useState } from 'react';
import type { TeamMember } from '../types';
import { X, User, Building2 } from 'lucide-react';

interface TimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, dates: string[]) => void;
  team: TeamMember[];
}

export const TimeOffModal: React.FC<TimeOffModalProps> = ({ isOpen, onClose, onSave, team }) => {
  const [selectedId, setSelectedId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !startDate || !endDate) return;

    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    if (current > end) {
      alert("Start date must be before end date");
      return;
    }

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    onSave(selectedId, dates);
    onClose();
    setStartDate('');
    setEndDate('');
    setSelectedId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Add Time Off / Holiday</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <div className="relative">
              <select
                required
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none appearance-none bg-white text-slate-700"
              >
                <option value="">Select...</option>
                <optgroup label="General">
                  <option value="UNIVERSITY_HOLIDAY">🏛️ University Holiday (All Staff)</option>
                </optgroup>
                <optgroup label="Staff Member">
                  {team.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                {selectedId === 'UNIVERSITY_HOLIDAY' ? <Building2 size={16} /> : <User size={16} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-700"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 italic mt-2">
            {selectedId === 'UNIVERSITY_HOLIDAY' 
              ? "This will create a holiday blackout period for the entire project."
              : "This will create blackout dates on the Gantt chart for the selected staff member."}
          </p>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors bg-white border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0021A5] text-white font-medium rounded-lg hover:bg-[#001b87] shadow-md transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};