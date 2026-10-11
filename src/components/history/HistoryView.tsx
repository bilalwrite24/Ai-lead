import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { 
  History, 
  Trash2, 
  ExternalLink, 
  Download, 
  PlusCircle, 
  Calendar, 
  Layers, 
  CheckCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { downloadCSVFile, generateCSVContent } from '../../services/csvParser';

export const HistoryView: React.FC = () => {
  const { sessions, loadSession, deleteSession, setActiveTab, clearCurrentBatch, showToast } = useApp();

  const handleExportSession = (
    session: typeof sessions[0],
    onlyQualified: boolean
  ) => {
    const leadsToExport = onlyQualified
      ? session.leads.filter((l) => l.qualificationStatus === 'QUALIFIED')
      : session.leads;

    if (leadsToExport.length === 0) {
      showToast('No leads available to export in this session.', 'error');
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
      'Fit Score',
      'Qualification Status',
      'Primary Assessment Reason',
    ];

    const rows = leadsToExport.map((lead) => [
      lead.companyName,
      lead.contactName,
      lead.jobTitle,
      lead.email,
      lead.industry,
      lead.country,
      lead.employeeCount,
      lead.fitScore,
      lead.qualificationStatus,
      lead.primaryReason,
    ]);

    const csvContent = generateCSVContent(headers, rows);
    const prefix = onlyQualified ? 'qualified' : 'all';
    downloadCSVFile(`history_${prefix}_${session.name.replace(/\s+/g, '_')}.csv`, csvContent);
    showToast(`Exported ${leadsToExport.length} leads`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Archive & Audit Log
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Qualification History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Locally stored qualification batches, audit metrics, and archived CSV exports.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            clearCurrentBatch();
            setActiveTab('qualification');
          }}
          icon={<PlusCircle className="w-4 h-4" />}
        >
          Qualify New List
        </Button>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Qualification Batches Yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
              When you score a prospect list and click "Save to History", it will appear here for fast re-auditing and CRM export.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveTab('qualification')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Start Your First Qualification Run
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Session Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{session.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {session.fileName}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(session.createdAt).toLocaleDateString()} at{' '}
                      {new Date(session.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      ICP: <strong className="text-slate-700">{session.icp.name}</strong>
                    </span>
                  </div>
                </div>

                {/* Score & Metrics Chips */}
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <div className="text-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total</div>
                    <div className="text-base font-bold font-mono text-slate-800">
                      {session.metrics.totalLeads}
                    </div>
                  </div>

                  <div className="text-center px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="text-[10px] text-emerald-600 uppercase font-semibold">Qualified</div>
                    <div className="text-base font-bold font-mono text-emerald-800">
                      {session.metrics.qualifiedCount}
                    </div>
                  </div>

                  <div className="text-center px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-[10px] text-amber-600 uppercase font-semibold">Review</div>
                    <div className="text-base font-bold font-mono text-amber-800">
                      {session.metrics.needsReviewCount}
                    </div>
                  </div>

                  <div className="text-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Score</div>
                    <div className="text-base font-bold font-mono text-slate-800">
                      {session.metrics.averageScore}/100
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => loadSession(session)}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Batch
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportSession(session, true)}
                    icon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
                    title="Export Qualified Leads"
                  >
                    Export Qualified
                  </Button>

                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
