import React, { useState } from 'react';
import { 
  ColumnMapping, 
  RawLeadRow, 
  STANDARD_FIELDS, 
  StandardLeadField 
} from '../../types/lead';
import { Button } from '../common/Button';
import { 
  Check, 
  AlertTriangle, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  Eye, 
  Copy,
  Table
} from 'lucide-react';
import { transformRowsToParsedLeads } from '../../services/csvParser';
import { detectDuplicates } from '../../services/duplicateDetector';
import { scoreAllLeads } from '../../services/scoringEngine';
import { useApp } from '../../context/AppContext';

interface MappingStepProps {
  headers: string[];
  rows: RawLeadRow[];
  initialMapping: ColumnMapping;
  fileName: string;
  onBack: () => void;
  onScoringComplete: () => void;
}

export const MappingStep: React.FC<MappingStepProps> = ({
  headers,
  rows,
  initialMapping,
  fileName,
  onBack,
  onScoringComplete,
}) => {
  const { activeICP, setCurrentBatchLeads, setCurrentBatchName, showToast } = useApp();
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(true);

  // Pre-calculate parsed preview & duplicates
  const parsedLeads = transformRowsToParsedLeads(rows, mapping);
  const deduplicatedLeads = detectDuplicates(parsedLeads);
  const duplicateCount = deduplicatedLeads.filter((l) => l.isDuplicate).length;

  const handleFieldChange = (header: string, standardField: StandardLeadField | 'ignore') => {
    setMapping((prev) => ({
      ...prev,
      [header]: standardField,
    }));
  };

  const isCompanyMapped = Object.values(mapping).includes('companyName');

  const handleRunScoring = () => {
    if (!isCompanyMapped) {
      showToast('Please map at least the "Company Name" column to proceed.', 'error');
      return;
    }

    let finalLeads = deduplicatedLeads;
    if (skipDuplicates && duplicateCount > 0) {
      finalLeads = deduplicatedLeads.filter((l) => !l.isDuplicate);
    }

    const scored = scoreAllLeads(finalLeads, activeICP);
    setCurrentBatchLeads(scored);
    setCurrentBatchName(fileName.replace(/\.csv$/i, '') || 'Scored Prospects');
    showToast(`Qualified and scored ${scored.length} prospect records`, 'success');
    onScoringComplete();
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Step 3 of 3: Column Mapping & Data Verification
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Map CSV Columns to LeadFit Schema
          </h3>
          <p className="text-xs text-slate-500">
            File: <strong className="text-slate-700 font-mono">{fileName}</strong> •{' '}
            <span className="font-mono">{rows.length} rows</span> detected
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            Upload Different File
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunScoring}
            disabled={!isCompanyMapped}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="shadow-sm font-bold"
          >
            Score {rows.length - (skipDuplicates ? duplicateCount : 0)} Prospects
          </Button>
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicateCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold">
                {duplicateCount} duplicate prospect{duplicateCount > 1 ? 's' : ''} detected
              </span>{' '}
              (matching emails or company + contact names).
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-amber-900 cursor-pointer select-none bg-amber-100/70 px-3 py-1.5 rounded-lg border border-amber-300">
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={(e) => setSkipDuplicates(e.target.checked)}
              className="accent-amber-600 rounded"
            />
            Skip duplicate rows during scoring
          </label>
        </div>
      )}

      {/* Grid: Column Mapping Form & Data Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Column Mapping Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              CSV Header Mapping
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {headers.length} Columns
            </span>
          </div>

          {!isCompanyMapped && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Company Name column must be mapped before scoring.</span>
            </div>
          )}

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {headers.map((header) => {
              const currentVal = mapping[header] || 'ignore';
              const isMapped = currentVal !== 'ignore';

              return (
                <div
                  key={header}
                  className={`p-3 rounded-lg border transition-all ${
                    isMapped
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold text-slate-800 truncate max-w-[180px]" title={header}>
                      {header}
                    </span>
                    {isMapped ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3 text-blue-600" /> Mapped
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        Ignored
                      </span>
                    )}
                  </div>

                  <select
                    value={currentVal}
                    onChange={(e) =>
                      handleFieldChange(header, e.target.value as StandardLeadField | 'ignore')
                    }
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ignore">— Ignore this column —</option>
                    {STANDARD_FIELDS.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label} {field.required ? '(Required)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 3-5 Row Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Raw Data Preview (First 4 Rows)
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Preview Mode
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Row</th>
                  <th className="px-3 py-2.5">Company</th>
                  <th className="px-3 py-2.5">Contact</th>
                  <th className="px-3 py-2.5">Job Title</th>
                  <th className="px-3 py-2.5">Industry</th>
                  <th className="px-3 py-2.5">Country</th>
                  <th className="px-3 py-2.5">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {deduplicatedLeads.slice(0, 4).map((lead, idx) => (
                  <tr key={lead.id} className={lead.isDuplicate ? 'bg-amber-50/50' : ''}>
                    <td className="px-3 py-2.5 font-mono text-slate-400 text-[11px]">
                      #{idx + 1}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900 max-w-[120px] truncate">
                      {lead.companyName || <span className="text-rose-400 italic">Empty</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-[110px] truncate">
                      {lead.contactName || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-[120px] truncate">
                      {lead.jobTitle || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-[100px] truncate">
                      {lead.industry || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-[90px] truncate">
                      {lead.country || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-600 text-[11px]">
                      {lead.employeeCount ? `${lead.employeeCount}` : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scoring Engine Assurance Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Deterministic Rules Engine Ready
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When you click <strong className="text-slate-700">Score Prospects</strong>, the engine
              evaluates every lead across your 5 ICP criteria (Industry {activeICP.weights.industry}%, Job Title {activeICP.weights.jobTitle}%, Headcount {activeICP.weights.employeeCount}%, Geography {activeICP.weights.country}%, Company Type {activeICP.weights.companyType}%).
              Missing data is never penalized as an outright mismatch.
            </p>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleRunScoring}
            disabled={!isCompanyMapped}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="w-full justify-center shadow-sm font-bold"
          >
            Launch LeadFit Scoring Engine ({rows.length - (skipDuplicates ? duplicateCount : 0)} Prospects)
          </Button>
        </div>
      </div>
    </div>
  );
};
