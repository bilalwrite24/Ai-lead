import React from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCards } from './MetricCards';
import { GettingStarted } from './GettingStarted';
import { Button } from '../common/Button';
import { 
  PlusCircle, 
  Download, 
  ArrowRight, 
  FileSpreadsheet, 
  Sparkles, 
  Clock, 
  Layers, 
  CheckCircle,
  Building,
  Target
} from 'lucide-react';
import { downloadSampleProspectsCSV } from '../../services/sampleData';

export const DashboardOverview: React.FC = () => {
  const { 
    globalMetrics, 
    setActiveTab, 
    currentBatchLeads, 
    currentBatchName, 
    sessions, 
    loadSession,
    showToast 
  } = useApp();

  const handleDownloadSample = () => {
    downloadSampleProspectsCSV();
    showToast('Downloaded fictional demonstration prospects CSV', 'info');
  };

  const hasLeads = globalMetrics.totalLeads > 0 || currentBatchLeads.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            B2B ICP Pipeline Overview
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Prospect Qualification Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rules-based qualification engine with zero data leakage and transparent score auditing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Sample CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('qualification')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Qualify New Leads
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <MetricCards metrics={globalMetrics} />

      {/* Conditional: Getting started (if 0 leads) or active runs dashboard */}
      {!hasLeads ? (
        <GettingStarted />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Batch Card */}
          <div className="lg:col-span-2 space-y-6">
            {currentBatchLeads.length > 0 ? (
              <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                      Active In-Memory Batch
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {currentBatchName || 'Prospect Batch'}
                    </h3>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('qualification')}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Open Scored Table
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100 my-4 text-center">
                  <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                    <div className="text-xs text-emerald-700 font-semibold">Qualified</div>
                    <div className="text-xl font-mono font-bold text-emerald-800">
                      {currentBatchLeads.filter((l) => l.qualificationStatus === 'QUALIFIED').length}
                    </div>
                  </div>
                  <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100">
                    <div className="text-xs text-amber-700 font-semibold">Needs Review</div>
                    <div className="text-xl font-mono font-bold text-amber-800">
                      {currentBatchLeads.filter((l) => l.qualificationStatus === 'NEEDS_REVIEW').length}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 font-semibold">Not Qualified</div>
                    <div className="text-xl font-mono font-bold text-slate-700">
                      {currentBatchLeads.filter((l) => l.qualificationStatus === 'NOT_QUALIFIED').length}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Total {currentBatchLeads.length} prospects in active memory</span>
                  <span className="font-mono">
                    Average Fit Score:{' '}
                    <strong className="text-slate-800">
                      {Math.round(
                        currentBatchLeads.reduce((a, b) => a + b.fitScore, 0) /
                          currentBatchLeads.length
                      )}
                      /100
                    </strong>
                  </span>
                </div>
              </div>
            ) : null}

            {/* Recent Batches List */}
            {sessions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Recent Qualification Batches
                  </h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View All History ({sessions.length})
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {sessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
                      onClick={() => loadSession(session)}
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{session.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{session.metrics.totalLeads} leads</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">
                            {session.metrics.qualifiedCount} Qualified
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadSession(session);
                        }}
                      >
                        Load Batch
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Top Industries & Qualification Tips */}
          <div className="space-y-6">
            {globalMetrics.topIndustries.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  Top Scored Industries
                </h4>
                <div className="space-y-2">
                  {globalMetrics.topIndustries.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate max-w-[160px]">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">{item.count} leads</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((item.count / globalMetrics.totalLeads) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best practices widget */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Target className="w-4 h-4" />
                Qualification Best Practices
              </div>
              <h4 className="text-sm font-semibold leading-snug">
                Why Transparent Rules Outperform Black-Box AI
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deterministic rules guarantee predictable, auditable results. Your clients get clear
                justifications for every lead accepted or rejected, eliminating guesswork and boosting
                trust.
              </p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Zero hallucinations</span>
                <span className="text-[11px] font-mono text-emerald-400">Auditable Rules</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
