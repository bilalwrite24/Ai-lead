import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TagInput } from '../common/TagInput';
import { Button } from '../common/Button';
import { ICPCriteria, SAMPLE_ICP_PRESETS } from '../../types/icp';
import { 
  Target, 
  Sliders, 
  Save, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Info,
  ChevronDown,
  Building,
  Globe,
  Briefcase,
  Users
} from 'lucide-react';

interface ICPStepProps {
  onContinue: () => void;
}

export const ICPStep: React.FC<ICPStepProps> = ({ onContinue }) => {
  const { activeICP, updateActiveICP, savedICPs, saveICPProfile, showToast } = useApp();
  const [showAdvancedWeights, setShowAdvancedWeights] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState(activeICP.name);

  const handleSelectPreset = (preset: ICPCriteria) => {
    updateActiveICP({
      ...preset,
      id: `icp_${Date.now()}`,
    });
    setProfileNameInput(preset.name);
    showToast(`Loaded preset "${preset.name}"`, 'info');
  };

  const handleSaveProfile = () => {
    const updated: ICPCriteria = {
      ...activeICP,
      id: activeICP.id || `icp_${Date.now()}`,
      name: profileNameInput.trim() || 'Custom Client ICP',
    };
    saveICPProfile(updated);
  };

  // Weight normalization helper
  const handleWeightChange = (key: keyof typeof activeICP.weights, value: number) => {
    updateActiveICP({
      weights: {
        ...activeICP.weights,
        [key]: value,
      },
    });
  };

  const totalWeights =
    activeICP.weights.industry +
    activeICP.weights.jobTitle +
    activeICP.weights.employeeCount +
    activeICP.weights.country +
    activeICP.weights.companyType;

  return (
    <div className="space-y-6">
      {/* Preset Selector & Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Step 1 of 3: Client Ideal Customer Profile
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Configure Target Qualification Criteria
            </h3>
            <p className="text-xs text-slate-500">
              Leads will be scored 0–100 against these deterministic constraints.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">Presets:</span>
            {SAMPLE_ICP_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  activeICP.name === preset.name
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {preset.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main ICP Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Criteria Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Firmographic Criteria */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" />
              Firmographic Targeting
            </h4>

            {/* Target Industries */}
            <TagInput
              label="Target Industries"
              helperText="E.g., SaaS, FinTech, Healthcare, Logistics, Professional Services"
              tags={activeICP.targetIndustries}
              onChange={(tags) => updateActiveICP({ targetIndustries: tags })}
              suggestedTags={[
                'SaaS',
                'Cloud Services',
                'FinTech',
                'Information Technology',
                'Enterprise Software',
                'E-commerce',
                'Healthcare',
                'Marketing & Advertising',
                'Logistics',
              ]}
              placeholder="Add industry (e.g., SaaS)..."
            />

            {/* Target Countries */}
            <TagInput
              label="Target Countries / Regions"
              helperText="E.g., United States, United Kingdom, Canada, Germany, Australia"
              tags={activeICP.targetCountries}
              onChange={(tags) => updateActiveICP({ targetCountries: tags })}
              suggestedTags={[
                'United States',
                'United Kingdom',
                'Canada',
                'Germany',
                'Australia',
                'France',
                'Singapore',
                'Netherlands',
              ]}
              placeholder="Add country (e.g., United States)..."
            />

            {/* Employee Count Range */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Target Company Headcount Range
                </label>
                <span className="text-xs font-mono text-slate-400">
                  {activeICP.minEmployees ?? '1'} to {activeICP.maxEmployees ?? 'Unlimited'} employees
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Minimum Employees</label>
                  <input
                    type="number"
                    min="1"
                    value={activeICP.minEmployees ?? ''}
                    onChange={(e) =>
                      updateActiveICP({
                        minEmployees: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    placeholder="E.g., 20"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Maximum Employees</label>
                  <input
                    type="number"
                    min="1"
                    value={activeICP.maxEmployees ?? ''}
                    onChange={(e) =>
                      updateActiveICP({
                        maxEmployees: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    placeholder="E.g., 500"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Headcount quick presets */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Quick sizes:</span>
                {[
                  { label: '1 - 10 (Startup)', min: 1, max: 10 },
                  { label: '11 - 50 (Seed)', min: 11, max: 50 },
                  { label: '50 - 250 (Mid-Market)', min: 50, max: 250 },
                  { label: '250 - 1000 (Scaleup)', min: 250, max: 1000 },
                  { label: '1000+ (Enterprise)', min: 1000, max: null },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      updateActiveICP({ minEmployees: preset.min, maxEmployees: preset.max })
                    }
                    className="text-[11px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Persona & Business Model */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-500" />
              Decision Maker & Company Type
            </h4>

            {/* Target Job Titles */}
            <TagInput
              label="Target Job Titles & Roles"
              helperText="E.g., VP of Sales, Head of Marketing, CEO, CRO, Director of Revenue Ops"
              tags={activeICP.targetJobTitles}
              onChange={(tags) => updateActiveICP({ targetJobTitles: tags })}
              suggestedTags={[
                'VP of Sales',
                'Head of Sales',
                'Chief Revenue Officer',
                'Director of Sales',
                'Founder',
                'CEO',
                'Head of Growth',
                'VP Operations',
                'CMO',
              ]}
              placeholder="Add job title (e.g., VP of Sales)..."
            />

            {/* Target Company Types */}
            <TagInput
              label="Target Company Types & Models"
              helperText="E.g., B2B SaaS, VC Funded, Agency, Private, Series A/B, Bootstrapped"
              tags={activeICP.targetCompanyTypes}
              onChange={(tags) => updateActiveICP({ targetCompanyTypes: tags })}
              suggestedTags={[
                'B2B SaaS',
                'VC Funded',
                'Series A/B/C',
                'Scaleup',
                'Bootstrapped',
                'Private',
                'Agency',
              ]}
              placeholder="Add company type..."
            />

            {/* Additional Requirements Text */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                Additional Campaign Requirements / Keywords (Optional)
              </label>
              <textarea
                value={activeICP.additionalRequirements}
                onChange={(e) => updateActiveICP({ additionalRequirements: e.target.value })}
                rows={2}
                placeholder="E.g., Must have active company website, corporate email domain, high pipeline focus..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Weights, Thresholds & Profile Manager */}
        <div className="space-y-6">
          {/* Profile Name & Save Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ICP Profile Settings
            </h4>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Profile Name
              </label>
              <input
                type="text"
                value={profileNameInput}
                onChange={(e) => {
                  setProfileNameInput(e.target.value);
                  updateActiveICP({ name: e.target.value });
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProfile}
              icon={<Save className="w-3.5 h-3.5" />}
              className="w-full justify-center"
            >
              Save Profile Preset
            </Button>
          </div>

          {/* Qualification Thresholds Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Score Thresholds
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">0 - 100</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Qualified Minimum
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    ≥ {activeICP.thresholds.qualified} pts
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={activeICP.thresholds.qualified}
                  onChange={(e) =>
                    updateActiveICP({
                      thresholds: {
                        ...activeICP.thresholds,
                        qualified: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Needs Review Minimum
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    ≥ {activeICP.thresholds.needsReview} pts
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={activeICP.thresholds.needsReview}
                  onChange={(e) =>
                    updateActiveICP({
                      thresholds: {
                        ...activeICP.thresholds,
                        needsReview: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-tight">
                Leads scoring below{' '}
                <strong className="text-slate-600 font-mono">
                  {activeICP.thresholds.needsReview}
                </strong>{' '}
                are marked <span className="font-semibold text-rose-600">Not Qualified</span>.
              </div>
            </div>
          </div>

          {/* Scoring Weight Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Scoring Weights
              </h4>
              <button
                type="button"
                onClick={() => setShowAdvancedWeights((prev) => !prev)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {showAdvancedWeights ? 'Hide Sliders' : 'Adjust Weights'}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Industry Relevance</span>
                <span className="font-mono font-semibold">{activeICP.weights.industry}%</span>
              </div>
              {showAdvancedWeights && (
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={activeICP.weights.industry}
                  onChange={(e) => handleWeightChange('industry', parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              )}

              <div className="flex justify-between text-slate-600">
                <span>Job Title / Seniority</span>
                <span className="font-mono font-semibold">{activeICP.weights.jobTitle}%</span>
              </div>
              {showAdvancedWeights && (
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={activeICP.weights.jobTitle}
                  onChange={(e) => handleWeightChange('jobTitle', parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              )}

              <div className="flex justify-between text-slate-600">
                <span>Employee Headcount</span>
                <span className="font-mono font-semibold">{activeICP.weights.employeeCount}%</span>
              </div>
              {showAdvancedWeights && (
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={activeICP.weights.employeeCount}
                  onChange={(e) =>
                    handleWeightChange('employeeCount', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              )}

              <div className="flex justify-between text-slate-600">
                <span>Target Geography</span>
                <span className="font-mono font-semibold">{activeICP.weights.country}%</span>
              </div>
              {showAdvancedWeights && (
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={activeICP.weights.country}
                  onChange={(e) => handleWeightChange('country', parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              )}

              <div className="flex justify-between text-slate-600">
                <span>Company Type / Model</span>
                <span className="font-mono font-semibold">{activeICP.weights.companyType}%</span>
              </div>
              {showAdvancedWeights && (
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={activeICP.weights.companyType}
                  onChange={(e) =>
                    handleWeightChange('companyType', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Weights Total</span>
              <span className="font-mono font-bold text-slate-700">{totalWeights}%</span>
            </div>
          </div>

          {/* Action Button: Proceed to Upload */}
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="w-full justify-center shadow-sm font-bold"
          >
            Continue to CSV Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
