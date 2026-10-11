import React from 'react';
import { CriterionMatchStatus, QualificationStatus } from '../../types/lead';

export const StatusBadge: React.FC<{ status: QualificationStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  if (status === 'QUALIFIED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Qualified
      </span>
    );
  }

  if (status === 'NEEDS_REVIEW') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Needs Review
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Not Qualified
    </span>
  );
};

export const ScoreBadge: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({
  score,
  size = 'md',
}) => {
  let colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score < 40) {
    colorStyle = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (score < 70) {
    colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-2.5 py-0.5 font-bold',
    lg: 'text-base px-3 py-1 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border font-mono ${colorStyle} ${sizeClasses[size]}`}
    >
      {score}
    </span>
  );
};

export const MatchBadge: React.FC<{ status: CriterionMatchStatus }> = ({ status }) => {
  switch (status) {
    case 'MATCH':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
          Match
        </span>
      );
    case 'PARTIAL':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">
          Partial
        </span>
      );
    case 'MISSING':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
          Missing Data
        </span>
      );
    case 'MISMATCH':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700">
          Mismatch
        </span>
      );
  }
};
