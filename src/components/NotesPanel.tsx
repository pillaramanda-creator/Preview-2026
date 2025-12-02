import React, { useState, useEffect } from 'react';
import type { ProjectData, AISummary } from '../types';
import { generateProjectSummary } from '../services/geminiService';
import { Sparkles, AlertTriangle, Send, X } from 'lucide-react';

interface NotesPanelProps {
  data: ProjectData;
  onAddNote: (note: any) => void;
  onUpdateSummary: (summary: AISummary) => void;
  onClose?: () => void;
  readOnly?: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ data, onAddNote, onUpdateSummary, onClose, readOnly }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newNoteType, setNewNoteType] = useState('general');

  useEffect(() => {
    // If data comes with a summary (e.g. from shared link), use it
    if (data.lastAnalysis) {
        setSummary(data.lastAnalysis);
    }
  }, [data.lastAnalysis]);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const result = await generateProjectSummary(data);
      setSummary(result);
      onUpdateSummary(result);
    } catch (e) {
      console.error(e);
      alert('Could not generate AI summary. Check API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newNote.trim()) return;
    
    onAddNote({
      id: Math.random().toString(36).substr(2, 9),
      content: newNote,
      timestamp: new Date().toISOString().split('T')[0],
      author: 'Current User', // Mocked
      type: newNoteType
    });
    setNewNote('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">Project Log & AI</h3>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button 
                onClick={handleGenerateSummary}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0021A5] to-[#FA4616] text-white px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
            >
                <Sparkles size={16} />
                {loading ? 'Thinking...' : 'AI Summary'}
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-full text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* AI Output Section */}
        {summary && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden animate-fade-in">
             <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
               <span className="text-xs font-bold text-[#0021A5] uppercase tracking-wider">AI Executive Brief</span>
             </div>
             <div className="p-4 space-y-4">
               <div className="prose prose-sm text-slate-700">
                 <p>{summary.summary}</p>
               </div>
               
               {summary.risks.length > 0 && (
                 <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                   <h4 className="flex items-center gap-2 text-red-800 font-bold text-sm mb-2">
                     <AlertTriangle size={14} /> Risk Assessment
                   </h4>
                   <ul className="list-disc pl-4 text-xs text-red-700 space-y-1">
                     {summary.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                   </ul>
                 </div>
               )}

              {summary.mitigations.length > 0 && (
                 <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                   <h4 className="flex items-center gap-2 text-[#22884C] font-bold text-sm mb-2">
                     <Sparkles size={14} /> Suggested Mitigations
                   </h4>
                   <ul className="list-disc pl-4 text-xs text-[#22884C] space-y-1">
                     {summary.mitigations.map((m, i) => <li key={i}>{m}</li>)}
                   </ul>
                 </div>
               )}
             </div>
          </div>
        )}

        {/* Input Note */}
        {!readOnly && (
            <form onSubmit={handleAddNote} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-blue-200">
            <textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log missed deadline, communication, or notes..."
                className="w-full text-sm border-0 focus:ring-0 p-2 resize-none mb-2 bg-slate-50 rounded-lg text-slate-800"
                rows={3}
            />
            <div className="flex justify-between items-center pt-1">
                <select 
                value={newNoteType} 
                onChange={(e) => setNewNoteType(e.target.value)}
                className="text-xs border-none bg-slate-100 rounded-md py-1.5 px-2 text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                <option value="general">General</option>
                <option value="missed_deadline">Missed Deadline</option>
                <option value="communication">Communication</option>
                <option value="risk">Risk</option>
                </select>
                <button type="submit" className="bg-[#0021A5] text-white p-2 rounded-lg hover:bg-[#001b87] transition-colors shadow-sm">
                <Send size={14} />
                </button>
            </div>
            </form>
        )}

        {/* Timeline Stream */}
        <div className="space-y-4">
           {data.notes.slice().reverse().map(note => (
             <div key={note.id} className="relative pl-4 border-l-2 border-gray-200 pb-2 group">
               <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ring-1 ring-white
                 ${note.type === 'missed_deadline' ? 'bg-[#FA4616]' : 
                   note.type === 'risk' ? 'bg-amber-500' : 
                   note.type === 'communication' ? 'bg-[#0021A5]' : 'bg-slate-400'}`}>
               </div>
               <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-700">{note.author}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{note.timestamp}</span>
                   </div>
                   <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                   {note.type !== 'general' && (
                     <div className="mt-2">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block uppercase tracking-wider
                         ${note.type === 'missed_deadline' ? 'bg-orange-50 text-[#FA4616] border border-orange-100' : 
                         note.type === 'risk' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                         note.type === 'communication' ? 'bg-blue-50 text-[#0021A5] border border-blue-100' : 'bg-slate-100 text-slate-600'}`}>
                         {note.type.replace('_', ' ')}
                       </span>
                     </div>
                   )}
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};