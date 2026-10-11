import React from 'react';
import { 
  Menu, 
  PlusCircle, 
  Download, 
  Building2, 
  User, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { downloadSampleProspectsCSV } from '../../services/sampleData';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const { activeTab, setActiveTab, agencySettings, clearCurrentBatch, showToast } = useApp();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Executive Dashboard',
          subtitle: 'Prospect list pipeline health and qualification metrics',
        };
      case 'qualification':
        return {
          title: 'Lead Qualification & Scoring',
          subtitle: 'Evaluate prospect lists against client Ideal Customer Profile',
        };
      case 'history':
        return {
          title: 'Qualification History',
          subtitle: 'Archive of past scored prospect lists and batch exports',
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'Manage ICP presets, scoring thresholds, and agency preferences',
        };
    }
  };

  const { title, subtitle } = getPageTitle();

  const handleStartNewQualification = () => {
    clearCurrentBatch();
    setActiveTab('qualification');
  };

  const handleDownloadSample = () => {
    downloadSampleProspectsCSV();
    showToast('Downloaded sample fictional prospects CSV', 'info');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Right: Actions & Profile Placeholder */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Sample CSV Download */}
        <button
          onClick={handleDownloadSample}
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
          title="Download fictional sample CSV for testing"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Sample CSV</span>
        </button>

        {/* Primary CTA */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleStartNewQualification}
          icon={<PlusCircle className="w-4 h-4" />}
          className="shadow-sm font-semibold whitespace-nowrap"
        >
          Qualify New Leads
        </Button>

        {/* Profile Placeholder */}
        <div className="hidden sm:flex items-center pl-2 border-l border-slate-200">
          <div className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-xs flex items-center justify-center">
              JR
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-semibold text-slate-800 block leading-tight group-hover:text-blue-600 transition-colors">
                {agencySettings.senderName || 'Jordan Reed'}
              </span>
              <span className="text-[11px] text-slate-400 block leading-none truncate max-w-[120px]">
                {agencySettings.agencyName || 'Agency Workspace'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
