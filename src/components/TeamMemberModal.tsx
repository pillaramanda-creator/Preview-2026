import React from 'react';
import type { ProjectData, TeamMember } from '../types';
import { X, Palmtree, User, Plus, Pencil, Settings } from 'lucide-react';

interface TeamAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProjectData;
  onAddMember: () => void;
  onEditMember: (member: TeamMember) => void;
  readOnly?: boolean;
}

export const TeamAvailabilityModal: React.FC<TeamAvailabilityModalProps> = ({ isOpen, onClose, data, onAddMember, onEditMember, readOnly }) => {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in-up border border-gray-100 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="text-[#0021A5]" size={24} /> Team & Availability
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          
          {/* Holidays Section */}
          <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-[#FA4616] font-bold mb-3 uppercase tracking-wider text-sm">
              <Palmtree size={18} /> University Holidays
            </h3>
            {data.holidays.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.holidays.sort().map(date => (
                  <div key={date} className="bg-red-50 text-red-800 px-3 py-2 rounded-lg text-sm font-medium border border-red-100 flex items-center justify-center">
                    {formatDate(date)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No holidays scheduled.</p>
            )}
          </div>

          {/* Staff Time Off Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-wider text-sm">
                    <User size={18} /> Team Members
                </h3>
                {!readOnly && (
                  <button 
                    onClick={onAddMember}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0021A5] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                      <Plus size={14} /> Add Member
                  </button>
                )}
            </div>
           
            
            <div className="space-y-3">
              {data.team.map(member => (
                <div key={member.id} className="flex flex-col sm:flex-row gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-gray-100 group">
                  {/* User Info */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-56 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                        <div>
                        <div className="font-bold text-slate-800 text-sm">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                        </div>
                    </div>
                    {!readOnly && (
                      <button 
                          onClick={() => onEditMember(member)}
                          className="p-1.5 text-gray-400 hover:text-[#0021A5] hover:bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-all sm:ml-auto"
                          title="Edit Member"
                      >
                          <Pencil size={14} />
                      </button>
                    )}
                  </div>

                  {/* Dates List */}
                  <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0 sm:pl-4">
                    <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Time Off</div>
                    {member.timeOff.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {member.timeOff.sort().map(date => (
                          <span key={date} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-gray-200">
                             {formatDate(date)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Full availability</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 text-slate-600 font-medium rounded-lg hover:bg-slate-100 shadow-sm"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};