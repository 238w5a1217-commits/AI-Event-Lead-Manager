'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Lead } from '@/types';
import LeadCard from '@/components/LeadCard';
import LeadTable from '@/components/LeadTable';
import LeadForm from '@/components/LeadForm';
import StatsBar from '@/components/StatsBar';
import {
  Plus, Search, RefreshCw, LayoutGrid, List,
  Users, Check, X
} from 'lucide-react';

const STATUS_TABS = [
  { value: '', label: 'All Leads' },
  { value: 'pending', label: 'Needs Follow-Up' },
  { value: 'in-progress', label: 'In Conversation' },
  { value: 'completed', label: 'Followed Up' },
  { value: 'not-needed', label: 'Not Needed' },
];

export default function LeadsDashboard() {
  // Constant baseline for stats, tabs, and event options
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Notices
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch all leads once to maintain steady constant pipeline stats
  const fetchAllLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?limit=300');
      const json = await res.json();
      if (json.success) {
        setAllLeads(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  // Filter leads for display - keeps StatsBar and tab counts constant!
  const displayLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      // 1. Status Filter
      if (statusFilter && lead.followUpStatus !== statusFilter) {
        return false;
      }

      // 2. Event Filter
      if (eventFilter && lead.event !== eventFilter) {
        return false;
      }

      // 3. Search Query Filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase().trim();
        const matchesName = lead.name?.toLowerCase().includes(query);
        const matchesCompany = lead.company?.toLowerCase().includes(query);
        const matchesEmail = lead.email?.toLowerCase().includes(query);
        const matchesEvent = lead.event?.toLowerCase().includes(query);
        const matchesNotes = lead.notes?.toLowerCase().includes(query);
        const matchesTags = lead.tags?.some((t) => t.toLowerCase().includes(query));

        if (!matchesName && !matchesCompany && !matchesEmail && !matchesEvent && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [allLeads, statusFilter, eventFilter, debouncedSearch]);

  const handleFormSuccess = (lead: unknown) => {
    const saved = lead as Lead;
    setShowForm(false);
    setEditingLead(null);
    if (editingLead) {
      setAllLeads((prev) => prev.map((l) => (l._id === saved._id ? saved : l)));
      showToast(`Updated contact: ${saved.name}`);
    } else {
      setAllLeads((prev) => [saved, ...prev]);
      showToast(`Saved new contact: ${saved.name}`);
    }
  };

  const handleDelete = async (id: string) => {
    const leadToDelete = allLeads.find((l) => l._id === id);
    if (!confirm(`Delete ${leadToDelete?.name || 'this contact'}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setAllLeads((prev) => prev.filter((l) => l._id !== id));
        showToast('Contact removed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = (updatedLead: Lead) => {
    setAllLeads((prev) => prev.map((l) => (l._id === updatedLead._id ? updatedLead : l)));
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleAiFromTable = async (lead: Lead, action: 'summarize' | 'draft') => {
    if (!lead.notes) {
      alert('This contact has no interaction notes to process.');
      return;
    }
    showToast(`AI ${action === 'summarize' ? 'summarizing notes' : 'drafting email'}...`);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead._id, action }),
      });
      const json = await res.json();
      if (json.success) {
        handleUpdate({ ...lead, ...json.data });
        showToast(`AI ${action === 'summarize' ? 'summary created' : 'email draft generated'}!`);
      } else {
        alert(json.error || 'AI generation failed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice((curr) => (curr === msg ? null : curr)), 3500);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setEventFilter('');
  };

  const hasActiveFilters = Boolean(search || statusFilter || eventFilter);
  // Constant unique events across all leads
  const uniqueEvents = Array.from(new Set(allLeads.map((l) => l.event).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0 shadow-2xs">
              EL
            </div>
            <h1 className="font-semibold text-slate-900 text-base sm:text-lg tracking-tight">
              EventLead Manager
            </h1>
          </div>

          {/* Action Button: Add Lead */}
          <button
            onClick={() => { setEditingLead(null); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-all active:scale-98"
          >
            <Plus size={15} />
            <span>Add Lead</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Notification */}
        {bannerNotice && (
          <div className="mb-4 p-3 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-medium flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Check size={15} className="text-emerald-400 flex-shrink-0" />
              <span>{bannerNotice}</span>
            </div>
            <button onClick={() => setBannerNotice(null)} className="text-slate-400 hover:text-white p-0.5">
              <X size={14} />
            </button>
          </div>
        )}

        {/* 5-Card Stats Bar: CONSTANT across all pipeline leads! */}
        <StatsBar leads={allLeads} />

        {/* Toolbar: Search, Event Select, Status Tabs, View Switcher */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs mb-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by contact, company, notes, event..."
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Event Filter & View Switcher */}
            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50/80 border border-slate-200/80 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-slate-400"
                >
                  <option value="">All Events ({uniqueEvents.length})</option>
                  {uniqueEvents.map((evt) => (
                    <option key={evt} value={evt}>{evt}</option>
                  ))}
                </select>
              </div>

              {/* View Switcher (Grid vs Table) */}
              <div className="flex items-center border border-slate-200/80 rounded-lg p-0.5 bg-slate-50 flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Spreadsheet Table View"
                >
                  <List size={15} />
                </button>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchAllLeads}
                disabled={loading}
                className="p-2 border border-slate-200/80 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 flex-shrink-0"
                title="Refresh leads"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Status Filter Tabs (Segmented bar, counts STAY CONSTANT from allLeads!) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-2 border-t border-slate-100 no-scrollbar">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              // Keep badge counts constant based on full pipeline!
              const count = tab.value
                ? allLeads.filter((l) => l.followUpStatus === tab.value).length
                : allLeads.length;

              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                    active
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-2xs px-1.5 py-0.5 rounded-full font-medium ${
                      active ? 'bg-slate-700 text-slate-100' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 ml-auto font-medium px-2 py-1 whitespace-nowrap flex-shrink-0"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Leads Display (Renders displayLeads) */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-16 flex flex-col items-center justify-center text-center shadow-2xs">
            <RefreshCw size={24} className="animate-spin text-slate-300 mb-2.5" />
            <span className="text-xs font-medium text-slate-400">Loading contacts...</span>
          </div>
        ) : displayLeads.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-10 sm:p-14 text-center max-w-sm mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              {hasActiveFilters ? 'No matching contacts' : 'No contacts found'}
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {hasActiveFilters
                ? 'Try adjusting your search query or clearing status filters.'
                : 'Start recording contacts met at events and conferences.'}
            </p>

            <div className="flex items-center justify-center gap-2">
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => { setEditingLead(null); setShowForm(true); }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  + Add New Lead
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {displayLeads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        ) : (
          <LeadTable
            leads={displayLeads}
            onSelectLead={handleEdit}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onAiAction={handleAiFromTable}
          />
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <LeadForm
          initialData={editingLead ? { ...editingLead } : undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditingLead(null); }}
        />
      )}
    </div>
  );
}
