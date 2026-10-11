import React, { useState } from 'react';
import { ScoredLead, QualificationStatus } from '../../types/lead';
import { ScoreBadge, StatusBadge, MatchBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  X, 
  ExternalLink, 
  Mail, 
  Building2, 
  MapPin, 
  Users, 
  Briefcase, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Edit3,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LeadDetailDrawerProps {
  lead: ScoredLead;
  onClose: () => void;
  onOpenOutreach: (lead: ScoredLead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onOpenOutreach,
}) => {
  const { updateLeadStatus, showToast } = useApp();
  const [overrideStatus, setOverrideStatus] = useState<QualificationStatus>(lead.qualificationStatus);
  const [overrideNotes, setOverrideNotes] = useState(lead.manualNotes || '');
  const [isEditingOverride, setIsEditingOverride] = useState(false);

  const handleSaveOverride = () => {
    updateLeadStatus(lead.id, overrideStatus, overrideNotes);
    setIsEditingOverride(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-xl bg-white shadow-2xl z-10 h-full flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lead Audit Profile
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-500">ID: {lead.id.slice(0, 10)}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Lead Header Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {lead.companyName || 'Unnamed Company'}
                  {lead.website && (
                    <a
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Visit company website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </h3>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {lead.contactName || 'Unspecified Contact'}{' '}
                  {lead.jobTitle && (
                    <span className="text-slate-500 font-normal">• {lead.jobTitle}</span>
                  )}
                </p>
                {lead.email && (
                  <p className="text-xs text-blue-600 font-mono mt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {lead.email}
                  </p>
                )}
              </div>

              {/* Large Score Box */}
              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Fit Score
                </div>
                <ScoreBadge score={lead.fitScore} size="lg" />
                <div className="mt-1.5">
                  <StatusBadge status={lead.qualificationStatus} size="sm" />
                </div>
              </div>
            </div>

            {/* Quick Metadata pills */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {lead.industry || 'No industry provided'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {lead.country || 'No country provided'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md border border-slate-200 font-mono">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {lead.employeeCount ? `${lead.employeeCount} headcount` : 'Size unstated'}
              </span>
            </div>
          </div>

          {/* Primary Reason Summary */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-blue-900 text-xs sm:text-sm">
            <span className="font-bold block mb-0.5 text-blue-950">Primary Fit Assessment:</span>
            {lead.primaryReason}
          </div>

          {/* Transparent Scoring Audit Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Transparent Criteria-by-Criteria Audit
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">5 Deterministic Rules</span>
            </div>

            <div className="space-y-2.5">
              {lead.criteriaResults.map((criterion, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{criterion.name}</span>
                    <div className="flex items-center gap-2">
                      <MatchBadge status={criterion.matchStatus} />
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {criterion.pointsEarned}/{criterion.maxPoints} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {criterion.explanation}
                  </p>

                  <div className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between">
                    <span>
                      Input: <strong className="text-slate-700">{criterion.inputValue}</strong>
                    </span>
                    <span className="truncate max-w-[200px]" title={criterion.targetCriteria}>
                      Target: {criterion.targetCriteria}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Positive Highlights & Flags/Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Positive Highlights
              </h5>
              {lead.positiveHighlights.length > 0 ? (
                <ul className="text-xs text-emerald-800 space-y-1">
                  {lead.positiveHighlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No specific highlights recorded.</p>
              )}
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
              <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Data Gaps & Notes
              </h5>
              {lead.flagsOrGaps.length > 0 ? (
                <ul className="text-xs text-amber-800 space-y-1">
                  {lead.flagsOrGaps.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No gaps or caveats detected.</p>
              )}
            </div>
          </div>

          {/* Manual Status Override */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                Manual Status Override
              </h5>
              {!isEditingOverride && (
                <button
                  type="button"
                  onClick={() => setIsEditingOverride(true)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Adjust Status
                </button>
              )}
            </div>

            {isEditingOverride ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    New Qualification Status
                  </label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value as QualificationStatus)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="QUALIFIED">Qualified</option>
                    <option value="NEEDS_REVIEW">Needs Review</option>
                    <option value="NOT_QUALIFIED">Not Qualified</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Override Reason / Auditor Notes
                  </label>
                  <input
                    type="text"
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    placeholder="E.g., Manually verified LinkedIn profile; headcount confirmed at 80"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingOverride(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSaveOverride}>
                    Save Override
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600">
                Current status:{' '}
                <strong className="text-slate-800">
                  {lead.qualificationStatus.replace('_', ' ')}
                </strong>
                {lead.manualNotes && (
                  <p className="mt-1 text-xs text-slate-500 italic">
                    Note: "{lead.manualNotes}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 z-20 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => onOpenOutreach(lead)}
            icon={<Send className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            Draft Outreach Email
          </Button>
        </div>
      </div>
    </div>
  );
};
