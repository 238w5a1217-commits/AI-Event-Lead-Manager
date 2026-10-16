'use client';

import { Lead } from '@/types';
import { Users, Clock, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  leads: Lead[];
}

export default function StatsBar({ leads }: StatsBarProps) {
  const total = leads.length;
  const pendingCount = leads.filter((l) => l.followUpStatus === 'pending').length;
  const inProgressCount = leads.filter((l) => l.followUpStatus === 'in-progress').length;
  const completedCount = leads.filter((l) => l.followUpStatus === 'completed').length;
  
  const followUpRate = total > 0 ? Math.round(((completedCount + inProgressCount) / total) * 100) : 0;
  const uniqueEvents = new Set(leads.map((l) => l.event).filter(Boolean)).size;

  const stats = [
    {
      label: 'TOTAL LEADS',
      value: total,
      subtext: `${uniqueEvents} events`,
      icon: Users,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
    },
    {
      label: 'NEEDS FOLLOW-UP',
      value: pendingCount,
      subtext: 'Awaiting outreach',
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      label: 'IN CONVERSATION',
      value: inProgressCount,
      subtext: 'Active discussion',
      icon: MessageSquare,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50',
    },
    {
      label: 'FOLLOWED UP',
      value: completedCount,
      subtext: 'Completed',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 mb-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg ${stat.iconBg} flex items-center justify-center ${stat.iconColor} flex-shrink-0`}>
                <Icon size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 font-normal truncate">{stat.subtext}</p>
            </div>
          </div>
        );
      })}

      {/* Conversion Rate Card */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">FOLLOW-UP RATE</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <TrendingUp size={14} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {followUpRate}%
            </span>
            <span className="text-xs text-slate-400 font-normal whitespace-nowrap">
              {completedCount + inProgressCount}/{total} done
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
              style={{ width: `${followUpRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
