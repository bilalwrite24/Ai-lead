import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Layers, 
  FileCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../common/Button';
import { parseCSVString, suggestColumnMapping } from '../../services/csvParser';
import { SAMPLE_PROSPECTS_CSV, downloadSampleProspectsCSV } from '../../services/sampleData';
import { RawLeadRow, ColumnMapping } from '../../types/lead';
import { useApp } from '../../context/AppContext';

interface UploadStepProps {
  onParsedSuccess: (params: {
    headers: string[];
    rows: RawLeadRow[];
    suggestedMapping: ColumnMapping;
    fileName: string;
  }) => void;
  onBackToICP: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({ onParsedSuccess, onBackToICP }) => {
  const { setCurrentFileName, showToast } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileContent = (content: string, fileName: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsed = parseCSVString(content);
      if (parsed.rows.length === 0) {
        throw new Error('The CSV file does not contain any data rows below the header.');
      }

      const suggestedMapping = suggestColumnMapping(parsed.headers);
      setCurrentFileName(fileName);
      showToast(`Successfully parsed ${parsed.rows.length} rows from ${fileName}`, 'success');

      onParsedSuccess({
        headers: parsed.headers,
        rows: parsed.rows,
        suggestedMapping,
        fileName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse CSV file format.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setErrorMessage('Please upload a valid .csv file format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processFileContent(text, file.name);
    };
    reader.onerror = () => {
      setErrorMessage('An error occurred reading the local file.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleData = () => {
    processFileContent(SAMPLE_PROSPECTS_CSV, 'fictional_sample_prospects.csv');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Step 2 of 3: Upload Prospect List
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Import Raw Prospects (CSV)
          </h3>
          <p className="text-xs text-slate-500">
            Files are processed 100% locally in your browser. Data never leaves your machine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBackToICP}>
            Back to ICP
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadSampleData}
            icon={<FileSpreadsheet className="w-4 h-4 text-blue-600" />}
          >
            Load Sample CSV (Fictional)
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.005]'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/60 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <UploadCloud className="w-8 h-8 stroke-[1.75]" />
        </div>

        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
          Drop your prospect CSV file here, or{' '}
          <span className="text-blue-600 underline underline-offset-2">browse files</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
          Supports common exports from Apollo, ZoomInfo, LinkedIn Sales Navigator, Clay, or custom scrapers.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono">
          <span>Supported columns: Company, Contact, Job Title, Email, Industry, Headcount, Country</span>
        </div>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold block mb-0.5">CSV Validation Failed:</span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Sample Data & Privacy Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900">Want to test with sample data?</h5>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              We provide 12 synthetic B2B prospect records (mixed qualified, borderline, and non-fit leads) so you can audit the scoring engine immediately.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSampleData}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                Use Sample Data Directly
              </Button>
              <button
                type="button"
                onClick={downloadSampleProspectsCSV}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
              >
                <Download className="w-3 h-3" /> Download .csv
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900">Zero Data Leakage Policy</h5>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              No API transmissions. Prospect lists never leave your browser memory. Duplicate detection, company size normalization, and scoring are completely private.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-400">
              Encrypted in-memory runtime • Zero telemetry
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
