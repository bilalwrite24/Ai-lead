import React from 'react';
import { 
  Target, 
  UploadCloud, 
  Cpu, 
  Send, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../common/Button';
import { downloadSampleProspectsCSV } from '../../services/sampleData';
import { useApp } from '../../context/AppContext';

export const GettingStarted: React.FC = () => {
  const { setActiveTab, showToast } = useApp();

  const handleDownloadSample = () => {
    downloadSampleProspectsCSV();
    showToast('Downloaded fictional demonstration prospects CSV', 'info');
  };

  const steps = [
    {
      number: '01',
      title: 'Define Client ICP',
      description:
        'Set target industries, titles, employee size range, geography, and custom weights for this campaign.',
      icon: Target,
    },
    {
      number: '02',
      title: 'Upload Prospect CSV',
      description:
        'Upload any raw list. Our parser auto-maps columns, validates fields, and detects duplicate contacts.',
      icon: UploadCloud,
    },
    {
      number: '03',
      title: 'Deterministic Fit Scoring',
      description:
        'Every lead receives an objective 0–100 score with exact explanations for every matched or missing criterion.',
      icon: Cpu,
    },
    {
      number: '04',
      title: 'Export & Outreach Drafts',
      description:
        'Export qualified lists for CRM import and generate personalized outreach email drafts in seconds.',
      icon: Send,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Hero Intro */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Welcome to LeadFit AI • Client Qualification Engine
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Qualify Prospect Lists Against Your Client's Ideal Customer Profile
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          LeadFit AI gives freelance lead generators and B2B sales agencies an objective,
          transparent system to score existing prospect lists. Eliminate wasted SDR hours,
          protect client domain reputation, and deliver clean, high-conversion pipelines.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setActiveTab('qualification')}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="shadow-sm font-semibold"
          >
            Qualify New Leads
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleDownloadSample}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Download Sample CSV (Fictional)
          </Button>
        </div>
      </div>

      {/* 4-Step Process Grid */}
      <div className="border-t border-slate-100 pt-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          How the 4-Step Qualification Workflow Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 relative group hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded">
                    {step.number}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy & Sample Data Disclaimer */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-normal">
            <span className="font-semibold text-slate-800">Browser-Local Execution Guarantee:</span>{' '}
            All CSV parsing, scoring computations, and deduplication occur exclusively within your
            local web browser memory. No prospect contact details are transmitted to external servers.
          </div>
        </div>
        <div className="text-[11px] text-slate-400 shrink-0 italic">
          * Sample CSV contains only synthetic records for testing.
        </div>
      </div>
    </div>
  );
};
