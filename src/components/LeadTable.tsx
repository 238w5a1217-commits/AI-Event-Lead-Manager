'use client';

import { Lead } from '@/types';
import {
  Calendar, Sparkles, Send, Edit3, Trash2, ChevronDown, Check, Copy,
  ExternalLink, X, FileText, ArrowUpRight
} from 'lucide-react';
import { useState } from 'react';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onUpdate: (lead: Lead) => void;
  onAiAction: (lead: Lead, action: 'summarize' | 'draft') => void;
  onSelectLead?: (lead: Lead) => void;
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  'pending': { label: 'Needs Follow-Up', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  'in-progress': { label: 'In Conversation', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  'completed': { label: 'Followed Up', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  'not-needed': { label: 'Not Needed', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export default function LeadTable({ leads, onEdit, onDelete, onUpdate, onAiAction, onSelectLead }: LeadTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLeadModal, setActiveLeadModal] = useState<Lead | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${lead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpStatus: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdate(json.data);
        if (activeLeadModal?._id === lead._id) {
          setActiveLeadModal(json.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 w-[28%]">Contact</th>
              <th className="py-3 px-4 w-[18%]">Event</th>
              <th className="py-3 px-4 w-[16%]">Status</th>
              <th className="py-3 px-4 w-[28%]">Notes & AI Insights</th>
              <th className="py-3 px-4 w-[10%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {leads.map((lead) => {
              const status = STATUS_CONFIG[lead.followUpStatus] || STATUS_CONFIG['pending'];
              return (
                <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Contact Info */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-semibold text-slate-900 text-sm">{lead.name}</div>
                    <div className="text-slate-500 font-medium text-xs mt-0.5">{lead.company}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-slate-500 hover:text-slate-900 truncate max-w-[170px]"
                      >
                        {lead.email}
                      </a>
                      <button
                        onClick={() => copyEmail(lead._id, lead.email)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                        title="Copy email"
                      >
                        {copiedId === lead._id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>

                  {/* Event */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                      <Calendar size={12} className="text-slate-500 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">{lead.event}</span>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="relative inline-block">
                      <select
                        value={lead.followUpStatus}
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                        className={`text-2xs sm:text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer appearance-none pr-6 focus:outline-none transition-colors ${status.badgeClass}`}
                      >
                        <option value="pending">Needs Follow-Up</option>
                        <option value="in-progress">In Conversation</option>
                        <option value="completed">Followed Up</option>
                        <option value="not-needed">Not Needed</option>
                      </select>
                      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </td>

                  {/* Notes & AI Summary Cell - Beautiful, Neat, Readable */}
                  <td className="py-3.5 px-4 align-top">
                    {lead.aiSummary ? (
                      <div
                        onClick={() => setActiveLeadModal(lead)}
                        className="group/summary cursor-pointer p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-150/80 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-2xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="inline-flex items-center gap-1 font-semibold text-2xs uppercase tracking-wider text-indigo-900">
                            <Sparkles size={11} className="text-indigo-600" />
                            AI Summary
                          </span>
                          <span className="text-2xs text-indigo-600 opacity-0 group-hover/summary:opacity-100 font-medium flex items-center gap-0.5 transition-opacity">
                            View all <ArrowUpRight size={10} />
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                          {lead.aiSummary}
                        </p>
                        {lead.aiDraftMessage && (
                          <div className="mt-1.5 pt-1.5 border-t border-indigo-100 flex items-center gap-1 text-2xs text-indigo-700 font-medium">
                            <Send size={10} />
                            <span>Follow-up email drafted</span>
                          </div>
                        )}
                      </div>
                    ) : lead.notes ? (
                      <div
                        onClick={() => setActiveLeadModal(lead)}
                        className="group/notes cursor-pointer p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="inline-flex items-center gap-1 font-semibold text-2xs uppercase tracking-wider text-slate-500">
                            <FileText size={11} className="text-slate-400" />
                            Notes
                          </span>
                          <span className="text-2xs text-slate-500 opacity-0 group-hover/notes:opacity-100 font-medium flex items-center gap-0.5 transition-opacity">
                            View <ArrowUpRight size={10} />
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {lead.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic py-1">
                        No notes recorded
                      </div>
                    )}
                  </td>

                  {/* Actions buttons */}
                  <td className="py-3.5 px-4 text-right align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onAiAction(lead, 'summarize')}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="AI Summarize"
                      >
                        <Sparkles size={15} />
                      </button>
                      <button
                        onClick={() => onAiAction(lead, 'draft')}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="AI Draft Follow-up Email"
                      >
                        <Send size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(lead)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit contact"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(lead._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal when clicking on any AI / Notes cell in table */}
      {activeLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {activeLeadModal.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {activeLeadModal.company}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{activeLeadModal.event}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveLeadModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Full Conversation Notes */}
              <div>
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Interaction Notes
                </span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {activeLeadModal.notes || 'No notes available.'}
                </div>
              </div>

              {/* Full AI Executive Summary */}
              {activeLeadModal.aiSummary && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} className="text-indigo-600" />
                      AI Executive Summary
                    </span>
                    <button
                      onClick={() => onAiAction(activeLeadModal, 'summarize')}
                      className="text-2xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-150 text-xs text-slate-800 leading-relaxed">
                    {activeLeadModal.aiSummary}
                  </div>
                </div>
              )}

              {/* Full Draft Follow-up Email */}
              {activeLeadModal.aiDraftMessage ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Send size={11} className="text-slate-600" />
                      Follow-up Email Draft
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyDraft(activeLeadModal.aiDraftMessage || '')}
                        className="inline-flex items-center gap-1 text-2xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                      >
                        {copiedDraft ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        {copiedDraft ? 'Copied' : 'Copy Email'}
                      </button>
                      <a
                        href={`mailto:${activeLeadModal.email}?body=${encodeURIComponent(activeLeadModal.aiDraftMessage)}`}
                        className="inline-flex items-center gap-1 text-2xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                      >
                        <ExternalLink size={11} />
                        Open Mail
                      </a>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {activeLeadModal.aiDraftMessage}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-500 mb-2">No follow-up email has been drafted yet.</p>
                  <button
                    onClick={() => onAiAction(activeLeadModal, 'draft')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    <Send size={12} />
                    Draft Follow-up Email with AI
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
              <button
                onClick={() => setActiveLeadModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
