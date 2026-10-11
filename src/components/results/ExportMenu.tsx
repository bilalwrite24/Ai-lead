import React, { useState } from 'react';
import { ScoredLead } from '../../types/lead';
import { Button } from '../common/Button';
import { Download, ChevronDown, CheckCircle, FileSpreadsheet, Check } from 'lucide-react';
import { downloadCSVFile, generateCSVContent } from '../../services/csvParser';
import { useApp } from '../../context/AppContext';

interface ExportMenuProps {
  leads: ScoredLead[];
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ leads }) => {
  const { activeICP, currentBatchName, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const qualifiedLeads = leads.filter((l) => l.qualificationStatus === 'QUALIFIED');

  const exportLeadsToCSV = (targetLeads: ScoredLead[], filenamePrefix: string) => {
    if (targetLeads.length === 0) {
      showToast('No leads available to export for this selection.', 'error');
      return;
    }

    const headers = [
      'Company Name',
      'Contact Name',
      'Job Title',
      'Email',
      'Industry',
      'Country',
      'Employee Count',
      'Website',
      'Company Type',
      'Fit Score',
      'Qualification Status',
      'Primary Assessment Reason',
      'Positive Highlights',
      'Flags and Gaps',
    ];

    const rows = targetLeads.map((lead) => [
      lead.companyName,
      lead.contactName,
      lead.jobTitle,
      lead.email,
      lead.industry,
      lead.country,
      lead.employeeCount,
      lead.website,
      lead.companyType,
      lead.fitScore,
      lead.qualificationStatus,
      lead.primaryReason,
      lead.positiveHighlights.join('; '),
      lead.flagsOrGaps.join('; '),
    ]);

    const csvContent = generateCSVContent(headers, rows);
    const dateStr = new Date().toISOString().split('T')[0];
    const cleanBatchName = (currentBatchName || 'leads').replace(/[^a-z0-9_-]/gi, '_');
    const filename = `${filenamePrefix}_${cleanBatchName}_${dateStr}.csv`;

    downloadCSVFile(filename, csvContent);
    showToast(`Exported ${targetLeads.length} leads to ${filename}`, 'success');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5">
        {/* Quick 1-click Export Qualified Only Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportLeadsToCSV(qualifiedLeads, 'leadfit_qualified')}
          icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
          className="font-semibold"
          disabled={leads.length === 0}
        >
          Export Qualified Only ({qualifiedLeads.length})
        </Button>

        {/* Dropdown toggle for All vs Qualified */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 focus:outline-none"
          title="More Export Options"
          disabled={leads.length === 0}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black/5 divide-y divide-slate-100 z-40 p-1">
            <div className="p-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                CSV Export Options
              </span>
              <button
                type="button"
                onClick={() => exportLeadsToCSV(qualifiedLeads, 'leadfit_qualified')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Qualified Leads Only</span>
                </div>
                <span className="font-mono text-slate-400">({qualifiedLeads.length})</span>
              </button>

              <button
                type="button"
                onClick={() => exportLeadsToCSV(leads, 'leadfit_all_scored')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between mt-1"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>All Scored Prospects</span>
                </div>
                <span className="font-mono text-slate-400">({leads.length})</span>
              </button>
            </div>
            <div className="p-2 text-[11px] text-slate-400 leading-tight">
              Includes full 0–100 score, audit status, and criterion justifications.
            </div>
          </div>
        </>
      )}
    </div>
  );
};
