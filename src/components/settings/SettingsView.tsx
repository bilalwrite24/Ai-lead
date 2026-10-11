import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { 
  Settings, 
  User, 
  Building2, 
  Sliders, 
  ShieldCheck, 
  Trash2, 
  Check, 
  Download,
  Info,
  Server
} from 'lucide-react';
import { downloadSampleProspectsCSV } from '../../services/sampleData';

export const SettingsView: React.FC = () => {
  const {
    agencySettings,
    updateAgencySettings,
    savedICPs,
    deleteICPProfile,
    activeICP,
    setActiveICP,
    showToast,
  } = useApp();

  const [agencyName, setAgencyName] = useState(agencySettings.agencyName);
  const [senderName, setSenderName] = useState(agencySettings.senderName);
  const [senderTitle, setSenderTitle] = useState(agencySettings.senderTitle);
  const [senderEmail, setSenderEmail] = useState(agencySettings.senderEmail);

  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencySettings({
      agencyName,
      senderName,
      senderTitle,
      senderEmail,
    });
  };

  const handleClearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear your local LeadFit AI cache? This will reset custom ICPs and saved session history in this browser.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Configuration & Defaults
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          System Settings & Agency Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure outreach signature parameters, manage saved client ICP profiles, and review data policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agency & Sender Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Agency & Outreach Signature
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            These variables are automatically inserted into AI Outreach email drafts and exported campaign packages.
          </p>

          <form onSubmit={handleSaveAgency} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Agency / Freelance Firm Name
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lead Generator / SDR Full Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sender Professional Title
              </label>
              <input
                type="text"
                value={senderTitle}
                onChange={(e) => setSenderTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sender Email
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <Button type="submit" variant="primary" size="sm" className="mt-2">
              Save Agency Profile
            </Button>
          </form>
        </div>

        {/* Saved ICP Profiles Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Saved Client ICP Profiles ({savedICPs.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Quickly switch between saved qualification profiles for different clients.
          </p>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {savedICPs.map((icp) => {
              const isActive = activeICP.id === icp.id || activeICP.name === icp.name;
              return (
                <div
                  key={icp.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{icp.name}</span>
                      {isActive && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[220px]">
                      {icp.targetIndustries.slice(0, 3).join(', ')} • {icp.minEmployees ?? '1'}-
                      {icp.maxEmployees ?? '∞'} staff
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isActive && (
                      <button
                        onClick={() => {
                          setActiveICP(icp);
                          showToast(`Switched active ICP to "${icp.name}"`, 'info');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100/50"
                      >
                        Activate
                      </button>
                    )}
                    {savedICPs.length > 1 && (
                      <button
                        onClick={() => deleteICPProfile(icp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deployment & Architecture Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Server className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Deployment & Privacy Architecture
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">GitHub & Vercel Ready</span>
            Pure standard React SPA architecture with Vite. Zero proprietary vendor lock-in. Deploys seamlessly to Vercel or GitHub Pages.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Zero External API Required</span>
            Initial working version is 100% self-contained. Deterministic scoring algorithm runs locally in microseconds with zero cost.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Gemini API Ready</span>
            Designed with modular draft service ready for optional server-side `@google/genai` integration via standard `/api` proxy.
          </div>
        </div>

        <div className="pt-3 flex items-center justify-between">
          <button
            onClick={downloadSampleProspectsCSV}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Download Fictional Demo CSV
          </button>
          <button
            onClick={handleClearLocalStorage}
            className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Local Cache
          </button>
        </div>
      </div>
    </div>
  );
};
