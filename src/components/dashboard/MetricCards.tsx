import React from 'react';
import { Users, CheckCircle, HelpCircle, XCircle, TrendingUp, Sparkles } from 'lucide-react';
import { QualificationBatchMetrics } from '../../types/session';

export const MetricCards: React.FC<{ metrics: QualificationBatchMetrics }> = ({ metrics }) => {
  const cards = [
    {
      label: 'Total Leads Processed',
      value: metrics.totalLeads.toLocaleString(),
      subtext: metrics.totalLeads === 0 ? 'No lists scored yet' : `${metrics.duplicateCount} duplicates identified`,
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200/80',
      borderAccent: 'border-l-blue-600',
    },
    {
      label: 'Qualified Leads',
      value: metrics.qualifiedCount.toLocaleString(),
      subtext:
        metrics.totalLeads > 0
          ? `${metrics.qualificationRate}% conversion rate`
          : 'Ready for outbound campaigns',
      icon: CheckCircle,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
      borderAccent: 'border-l-emerald-600',
    },
    {
      label: 'Leads Needing Review',
      value: metrics.needsReviewCount.toLocaleString(),
      subtext:
        metrics.needsReviewCount > 0
          ? 'Missing fields or border criteria'
          : 'Awaiting inspection',
      icon: HelpCircle,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200/80',
      borderAccent: 'border-l-amber-500',
    },
    {
      label: 'Rejected (Not Qualified)',
      value: metrics.notQualifiedCount.toLocaleString(),
      subtext:
        metrics.totalLeads > 0
          ? `${Math.round((metrics.notQualifiedCount / metrics.totalLeads) * 100)}% filtered out`
          : 'Out-of-ICP prospects filtered',
      icon: XCircle,
      iconBg: 'bg-slate-100 text-slate-500 border-slate-200',
      borderAccent: 'border-l-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden border-l-4 ${card.borderAccent}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
                  {card.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center border ${card.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span>{card.subtext}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
};
