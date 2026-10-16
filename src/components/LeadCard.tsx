'use client';

import { useState } from 'react';
import { Lead } from '@/types';
import {
  Building2, Mail, Phone, Calendar, Sparkles, Send,
  Copy, Check, Trash2, Edit3, ChevronDown, ChevronUp, ExternalLink,
  FileText
} from 'lucide-react';
import StatusDropdown from './StatusDropdown';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onUpdate: (lead: Lead) => void;
}

export default function LeadCard({ lead, onEdit, onDelete, onUpdate }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loadingAi, setLoadingAi] = useState<'summarize' | 'draft' | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${lead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpStatus: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdate(json.data);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleAiAction = async (action: 'summarize' | 'draft') => {
    if (!lead.notes || lead.notes.trim() === '') {
      setErrorMsg('Add notes before generating AI insights.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    setLoadingAi(action);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead._id, action }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdate({ ...lead, ...json.data });
        setExpanded(true);
      } else {
        setErrorMsg(json.error || 'AI generation failed');
      }
    } catch (e) {
      console.error('AI call failed:', e);
      setErrorMsg('Network error connecting to AI service');
    } finally {
      setLoadingAi(null);
    }
  };

  const copyDraft = () => {
    if (lead.aiDraftMessage) {
      navigator.clipboard.writeText(lead.aiDraftMessage);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(lead.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const initials = lead.name
    ? lead.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'L';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden">
      {/* Card Content */}
      <div className="p-4 sm:p-5">
        {/* Contact Header */}
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">
                {lead.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                <Building2 size={11} className="text-slate-400 flex-shrink-0" />
                <span className="truncate font-medium text-slate-600">{lead.company}</span>
              </div>
            </div>
          </div>

          {/* Status Dropdown - Neat, single-line pill */}
          <StatusDropdown
            value={lead.followUpStatus}
            onChange={handleStatusChange}
            align="right"
            className="flex-shrink-0"
          />
        </div>

        {/* Event context pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium mb-3">
          <Calendar size={12} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{lead.event}</span>
        </div>

        {/* Contact info list */}
        <div className="space-y-1 text-xs text-slate-600 mb-3.5">
          <div className="flex items-center justify-between group/email py-0.5">
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 truncate transition-colors"
            >
              <Mail size={13} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </a>
            <button
              onClick={copyEmail}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
              title="Copy email address"
            >
              {copiedEmail ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            </button>
          </div>

          {lead.phone && (
            <div className="flex items-center gap-2 text-slate-600 py-0.5">
              <Phone size={13} className="text-slate-400 flex-shrink-0" />
              <a href={`tel:${lead.phone}`} className="hover:text-slate-900 transition-colors">
                {lead.phone}
              </a>
            </div>
          )}
        </div>

        {/* Conversation Notes */}
        {lead.notes && (
          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/70 mb-3">
            <div className="flex items-center gap-1.5 text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <FileText size={11} />
              <span>NOTES</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {lead.tags.map((tag) => (
              <span
                key={tag}
                className="text-2xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {errorMsg && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-2">
            {errorMsg}
          </div>
        )}

        {/* AI Summary Section */}
        {lead.aiSummary && !expanded && (
          <div className="mt-2.5 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-900 text-2xs uppercase tracking-wider mb-1">
              <Sparkles size={12} className="text-indigo-600" />
              <span>AI SUMMARY</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {lead.aiSummary}
            </p>
          </div>
        )}
      </div>

      {/* Expanded Details section */}
      {expanded && (
        <div className="px-5 pb-4 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-3">
          {lead.aiSummary && (
            <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-indigo-600" />
                  Executive Summary
                </span>
                <button
                  onClick={() => handleAiAction('summarize')}
                  disabled={loadingAi === 'summarize'}
                  className="text-2xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Regenerate
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{lead.aiSummary}</p>
            </div>
          )}

          {lead.aiDraftMessage ? (
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                <span className="text-2xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Send size={11} className="text-slate-600" />
                  Follow-up Email Draft
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyDraft}
                    className="inline-flex items-center gap-1 text-2xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                  >
                    {copiedDraft ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    {copiedDraft ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={`mailto:${lead.email}?body=${encodeURIComponent(lead.aiDraftMessage)}`}
                    className="inline-flex items-center gap-1 text-2xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                  >
                    <ExternalLink size={11} />
                    Open Mail
                  </a>
                </div>
              </div>
              <div className="text-xs text-slate-700 whitespace-pre-wrap font-sans bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed max-h-48 overflow-y-auto">
                {lead.aiDraftMessage}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Card Footer Toolbar */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAiAction('summarize')}
            disabled={loadingAi === 'summarize'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="Summarize notes with Gemini AI"
          >
            <Sparkles size={12} className="text-indigo-600" />
            <span>Summarize</span>
          </button>

          <button
            onClick={() => handleAiAction('draft')}
            disabled={loadingAi === 'draft'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="Draft personalized follow-up email"
          >
            <Send size={12} className="text-slate-600" />
            <span>Draft Email</span>
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={() => onEdit(lead)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
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
      </div>
    </div>
  );
}
