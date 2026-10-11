import React, { useState, useEffect } from 'react';
import { ScoredLead } from '../../types/lead';
import { OutreachFramework } from '../../types/outreach';
import { OUTREACH_TEMPLATES, generateOutreachDraft } from '../../services/draftGenerator';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle,
  Mail,
  User,
  Building2,
  Briefcase
} from 'lucide-react';

interface OutreachDraftModalProps {
  lead: ScoredLead;
  onClose: () => void;
}

export const OutreachDraftModal: React.FC<OutreachDraftModalProps> = ({ lead, onClose }) => {
  const { activeICP, agencySettings, showToast } = useApp();

  const [selectedFramework, setSelectedFramework] = useState<OutreachFramework>('pain_point_agitate');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate initial draft or update when framework changes
  useEffect(() => {
    const draft = generateOutreachDraft(lead, activeICP, selectedFramework, agencySettings);
    setSubject(draft.subject);
    setBody(draft.body);
  }, [lead, activeICP, selectedFramework, agencySettings]);

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      showToast('Outreach draft copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleOpenMailto = () => {
    const emailTo = lead.email || '';
    const mailtoUrl = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const currentTemplate = OUTREACH_TEMPLATES.find((t) => t.id === selectedFramework)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Outreach Email Draft Generator
              </h3>
              <p className="text-xs text-slate-500">
                Draft for {lead.contactName || 'Decision Maker'} at {lead.companyName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Important Draft Label Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Human Review Required:</span> This is an editable outreach
              draft generated from lead attributes and client ICP parameters. Emails are never
              sent automatically. Review and customize before sending.
            </div>
          </div>

          {/* Framework Selector Tabs */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Select Outreach Framework
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OUTREACH_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedFramework(tpl.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedFramework === tpl.id
                      ? 'border-blue-500 bg-blue-50/60 shadow-2xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-blue-600 block mb-0.5">
                    {tpl.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {tpl.name.split('(')[0].trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Subject */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Editable Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Email Body Content
              </label>
              <span className="text-[11px] text-slate-400">
                Tokens automatically populated
              </span>
            </div>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Lead Context Quick Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Target: <strong className="text-slate-800">{lead.contactName || 'Decision Maker'}</strong>
            </span>
            <span>
              Company: <strong className="text-slate-800">{lead.companyName}</strong>
            </span>
            <span>
              Email:{' '}
              <strong className="text-blue-600 font-mono">
                {lead.email || 'None provided'}
              </strong>
            </span>
            <span>
              Score: <strong className="text-emerald-700 font-mono">{lead.fitScore}/100</strong>
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Draft'}
            </Button>

            {lead.email && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenMailto}
                icon={<Mail className="w-3.5 h-3.5" />}
              >
                Open in Email Client
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
