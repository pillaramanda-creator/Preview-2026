import React, { useState, useEffect } from 'react';
import type { TeamMember } from '../types';
import { X, User, Briefcase, Image as ImageIcon, Trash2 } from 'lucide-react';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  member: TeamMember | null;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ isOpen, onClose, onSave, onDelete, member }) => {
  const [formData, setFormData] = useState<TeamMember>({
    id: '',
    name: '',
    role: '',
    avatar: '',
    timeOff: []
  });

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
    } else {
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        role: '',
        avatar: `https://ui-avatars.com/api/?name=New+User&background=random`,
        timeOff: []
      });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.role) {
      // Use UI Avatars if avatar is empty
      const finalAvatar = formData.avatar.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;
      onSave({ ...formData, avatar: finalAvatar });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Preview */}
          <div className="flex justify-center mb-2">
            <div className="relative group">
              <img 
                src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=random`} 
                alt="Preview" 
                className="w-24 h-24 rounded-full border-4 border-blue-50 shadow-md object-cover bg-slate-100"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=random`;
                }}
              />
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                <ImageIcon className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" size={24} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <User size={14} className="text-gray-400"/> Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 placeholder-gray-400"
              placeholder="e.g. Alice Chen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Briefcase size={14} className="text-gray-400"/> Role / Title
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 placeholder-gray-400"
              placeholder="e.g. Senior Designer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <ImageIcon size={14} className="text-gray-400"/> Avatar URL
            </label>
            <input
              type="text"
              value={formData.avatar}
              onChange={e => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] outline-none bg-white text-slate-900 placeholder-gray-400 text-sm"
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use a generated avatar.</p>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
            {member ? (
                <button
                    type="button"
                    onClick={() => {
                        if(window.confirm('Delete this team member? Tasks assigned to them will become unassigned.')) {
                            onDelete(member.id);
                        }
                    }}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                    <Trash2 size={16} /> Delete
                </button>
            ) : (
                <div></div>
            )}
            
            <div className="flex gap-3">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors bg-white border border-gray-200"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="px-6 py-2 bg-[#0021A5] text-white font-medium rounded-lg hover:bg-[#001b87] shadow-md transition-colors"
                >
                {member ? 'Save Changes' : 'Add Member'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};