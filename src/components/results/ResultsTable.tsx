import React, { useState, useMemo } from 'react';
import { ScoredLead, QualificationStatus, SortState } from '../../types/lead';
import { ScoreBadge, StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ExportMenu } from './ExportMenu';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Mail, 
  Send, 
  SlidersHorizontal,
  BookmarkPlus,
  RefreshCw,
  X,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ResultsTableProps {
  leads: ScoredLead[];
  onInspectLead: (lead: ScoredLead) => void;
  onOpenOutreach: (lead: ScoredLead) => void;
  onReScore: () => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  leads,
  onInspectLead,
  onOpenOutreach,
  onReScore,
}) => {
  const { currentBatchName, saveCurrentAsSession, showToast, activeICP } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | QualificationStatus>('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  const [sortState, setSortState] = useState<SortState>({
    column: 'fitScore',
    direction: 'desc',
  });

  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Distinct industries & countries for filters
  const uniqueIndustries = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.industry) set.add(l.industry);
    });
    return Array.from(set).sort();
  }, [leads]);

  const uniqueCountries = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.country) set.add(l.country);
    });
    return Array.from(set).sort();
  }, [leads]);

  // Counts for tabs
  const countAll = leads.length;
  const countQualified = leads.filter((l) => l.qualificationStatus === 'QUALIFIED').length;
  const countReview = leads.filter((l) => l.qualificationStatus === 'NEEDS_REVIEW').length;
  const countRejected = leads.filter((l) => l.qualificationStatus === 'NOT_QUALIFIED').length;
  const countDuplicates = leads.filter((l) => l.isDuplicate).length;

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Status filter
      if (selectedStatus !== 'ALL' && lead.qualificationStatus !== selectedStatus) {
        return false;
      }

      // Industry filter
      if (selectedIndustry !== 'ALL' && lead.industry !== selectedIndustry) {
        return false;
      }

      // Country filter
      if (selectedCountry !== 'ALL' && lead.country !== selectedCountry) {
        return false;
      }

      // Duplicate filter
      if (onlyDuplicates && !lead.isDuplicate) {
        return false;
      }

      // Min score filter
      if (lead.fitScore < minScoreFilter) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matches =
          (lead.companyName && lead.companyName.toLowerCase().includes(query)) ||
          (lead.contactName && lead.contactName.toLowerCase().includes(query)) ||
          (lead.jobTitle && lead.jobTitle.toLowerCase().includes(query)) ||
          (lead.email && lead.email.toLowerCase().includes(query)) ||
          (lead.industry && lead.industry.toLowerCase().includes(query)) ||
          (lead.primaryReason && lead.primaryReason.toLowerCase().includes(query));

        if (!matches) return false;
      }

      return true;
    });
  }, [
    leads,
    selectedStatus,
    selectedIndustry,
    selectedCountry,
    onlyDuplicates,
    minScoreFilter,
    searchQuery,
  ]);

  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let valA: any = a[sortState.column] ?? '';
      let valB: any = b[sortState.column] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortState.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortState]);

  const handleSort = (column: SortState['column']) => {
    setSortState((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        column,
        direction: 'desc',
      };
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(new Set(sortedLeads.map((l) => l.id)));
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveToHistory = () => {
    const session = saveCurrentAsSession();
    if (session) {
      showToast(`Batch saved to history (${leads.length} leads)`, 'success');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        {/* Batch Info & Top CTA Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Scored Batch: {currentBatchName}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Prospect Qualification Results
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated against ICP:{' '}
              <strong className="text-blue-700 font-semibold">{activeICP.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToHistory}
              icon={<BookmarkPlus className="w-3.5 h-3.5 text-blue-600" />}
            >
              Save to History
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onReScore}
              icon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
            >
              Adjust ICP & Re-Score
            </Button>

            <ExportMenu leads={leads} />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Leads <span className="font-mono text-[11px] ml-1">({countAll})</span>
            </button>

            <button
              onClick={() => setSelectedStatus('QUALIFIED')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                selectedStatus === 'QUALIFIED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              Qualified <span className="font-mono text-[11px] ml-1">({countQualified})</span>
            </button>

            <button
              onClick={() => setSelectedStatus('NEEDS_REVIEW')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                selectedStatus === 'NEEDS_REVIEW'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <HelpCircle className="w-3 h-3" />
              Needs Review <span className="font-mono text-[11px] ml-1">({countReview})</span>
            </button>

            <button
              onClick={() => setSelectedStatus('NOT_QUALIFIED')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                selectedStatus === 'NOT_QUALIFIED'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-3 h-3" />
              Not Qualified <span className="font-mono text-[11px] ml-1">({countRejected})</span>
            </button>
          </div>

          {countDuplicates > 0 && (
            <label className="text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyDuplicates}
                onChange={(e) => setOnlyDuplicates(e.target.checked)}
                className="accent-amber-600 rounded"
              />
              Show Duplicates Only ({countDuplicates})
            </label>
          )}
        </div>

        {/* Search & Dropdown Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, contact, title..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Industry dropdown */}
          <div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Industries ({uniqueIndustries.length})</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Country dropdown */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Countries ({uniqueCountries.length})</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Min score slider */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-[11px] text-slate-500 whitespace-nowrap">
              Min Score: <strong className="text-slate-800 font-mono">{minScoreFilter}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] select-none">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      sortedLeads.length > 0 &&
                      sortedLeads.every((l) => selectedLeadIds.has(l.id))
                    }
                    onChange={handleSelectAll}
                    className="accent-blue-600 rounded cursor-pointer"
                  />
                </th>

                <th
                  onClick={() => handleSort('companyName')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('contactName')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Contact</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('jobTitle')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Job Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('industry')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Industry</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('country')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Country</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('fitScore')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Fit Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('qualificationStatus')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="px-4 py-3.5 min-w-[200px]">Primary Reason</th>

                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No leads match the active filters.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search terms or lowering score threshold.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedLeads.map((lead) => {
                  const isSelected = selectedLeadIds.has(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onInspectLead(lead)}
                      className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectLead(lead.id)}
                          className="accent-blue-600 rounded cursor-pointer"
                        />
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="truncate max-w-[150px]">{lead.companyName}</span>
                          {lead.website && (
                            <a
                              href={
                                lead.website.startsWith('http')
                                  ? lead.website
                                  : `https://${lead.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-blue-600 transition-colors"
                              title={lead.website}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {lead.isDuplicate && (
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded font-medium inline-block mt-0.5">
                            Duplicate
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        <div className="truncate max-w-[130px]">
                          {lead.contactName || <span className="text-slate-300 italic">—</span>}
                        </div>
                        {lead.email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px] font-mono">
                            {lead.email}
                          </div>
                        )}
                      </td>

                      {/* Job Title */}
                      <td className="px-4 py-3 text-slate-700">
                        <div className="truncate max-w-[140px]" title={lead.jobTitle}>
                          {lead.jobTitle || <span className="text-slate-300 italic">—</span>}
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="px-4 py-3 text-slate-600">
                        <span className="truncate max-w-[110px] block" title={lead.industry}>
                          {lead.industry || <span className="text-slate-300 italic">—</span>}
                        </span>
                      </td>

                      {/* Country */}
                      <td className="px-4 py-3 text-slate-600">
                        <span className="truncate max-w-[90px] block" title={lead.country}>
                          {lead.country || <span className="text-slate-300 italic">—</span>}
                        </span>
                      </td>

                      {/* Fit Score */}
                      <td className="px-4 py-3 text-center">
                        <ScoreBadge score={lead.fitScore} size="sm" />
                      </td>

                      {/* Qualification Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={lead.qualificationStatus} size="sm" />
                      </td>

                      {/* Primary Reason */}
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        <div className="truncate max-w-[240px]" title={lead.primaryReason}>
                          {lead.primaryReason}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenOutreach(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                          title="Generate personalized outreach draft"
                        >
                          <Send className="w-3 h-3" />
                          <span>Draft</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 px-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-mono">{sortedLeads.length}</strong> of{' '}
            <strong className="text-slate-800 font-mono">{leads.length}</strong> scored leads
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click any row to view complete transparent criteria audit breakdown
          </span>
        </div>
      </div>
    </div>
  );
};
