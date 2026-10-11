import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  History, 
  Settings, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react';
import { useApp, ActiveNavTab } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, currentBatchLeads } = useApp();

  const navigationItems = [
    {
      id: 'dashboard' as ActiveNavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'qualification' as ActiveNavTab,
      label: 'Lead Qualification',
      icon: Target,
      badge: currentBatchLeads.length > 0 ? `${currentBatchLeads.length} leads` : null,
    },
    {
      id: 'history' as ActiveNavTab,
      label: 'Qualification History',
      icon: History,
      badge: null,
    },
    {
      id: 'settings' as ActiveNavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: ActiveNavTab) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Target className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                  LeadFit <span className="text-blue-600">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block -mt-0.5">
                  B2B ICP Engine
                </span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isActive ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Stats or Active Batch Mini Card */}
          {currentBatchLeads.length > 0 && (
            <div className="mx-3 mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                  Active Batch
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {currentBatchLeads.length} leads
                </span>
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed truncate">
                {currentBatchLeads.filter((l) => l.qualificationStatus === 'QUALIFIED').length} Qualified •{' '}
                {currentBatchLeads.filter((l) => l.qualificationStatus === 'NEEDS_REVIEW').length} In Review
              </div>
              <button
                onClick={() => handleNavClick('qualification')}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
              >
                Inspect Results <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Footer & Privacy Banner */}
        <div className="p-3 border-t border-slate-100 space-y-3">
          <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 leading-tight">
                <span className="font-semibold text-slate-800 block mb-0.5">
                  100% Client-Side Privacy
                </span>
                Prospect data is parsed securely in your browser. Never uploaded to external servers.
              </div>
            </div>
          </div>

          <div className="px-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>LeadFit v1.0 • B2B SaaS</span>
            <span className="font-mono">Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
