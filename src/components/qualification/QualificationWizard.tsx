import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ICPStep } from './ICPStep';
import { UploadStep } from './UploadStep';
import { MappingStep } from './MappingStep';
import { ResultsTable } from '../results/ResultsTable';
import { LeadDetailDrawer } from '../results/LeadDetailDrawer';
import { OutreachDraftModal } from '../outreach/OutreachDraftModal';
import { RawLeadRow, ColumnMapping, ScoredLead } from '../../types/lead';
import { Target, UploadCloud, Sliders, CheckCircle2 } from 'lucide-react';

export const QualificationWizard: React.FC = () => {
  const {
    currentBatchLeads,
    clearCurrentBatch,
    inspectLead,
    setInspectLead,
    outreachLead,
    setOutreachLead,
  } = useApp();

  const [wizardStep, setWizardStep] = useState<'icp' | 'upload' | 'mapping'>('icp');
  const [parsedData, setParsedData] = useState<{
    headers: string[];
    rows: RawLeadRow[];
    suggestedMapping: ColumnMapping;
    fileName: string;
  } | null>(null);

  // If there are already scored leads in the active batch, show the results view
  if (currentBatchLeads.length > 0) {
    return (
      <div className="space-y-6">
        <ResultsTable
          leads={currentBatchLeads}
          onInspectLead={(lead) => setInspectLead(lead)}
          onOpenOutreach={(lead) => setOutreachLead(lead)}
          onReScore={() => {
            clearCurrentBatch();
            setWizardStep('icp');
          }}
        />

        {/* Lead Detail Drawer */}
        {inspectLead && (
          <LeadDetailDrawer
            lead={inspectLead}
            onClose={() => setInspectLead(null)}
            onOpenOutreach={(lead) => {
              setInspectLead(null);
              setOutreachLead(lead);
            }}
          />
        )}

        {/* Outreach Draft Modal */}
        {outreachLead && (
          <OutreachDraftModal
            lead={outreachLead}
            onClose={() => setOutreachLead(null)}
          />
        )}
      </div>
    );
  }

  // Wizard Flow Header Steps Indicator
  const steps = [
    { id: 'icp', label: '1. Configure ICP', icon: Target },
    { id: 'upload', label: '2. Upload CSV', icon: UploadCloud },
    { id: 'mapping', label: '3. Map & Score', icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      {/* Step Stepper Indicator */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = wizardStep === st.id;
            const isDone =
              (st.id === 'icp' && (wizardStep === 'upload' || wizardStep === 'mapping')) ||
              (st.id === 'upload' && wizardStep === 'mapping');

            return (
              <React.Fragment key={st.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-blue-700'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-colors ${
                      isDone ? 'bg-emerald-300' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard Steps */}
      {wizardStep === 'icp' && (
        <ICPStep onContinue={() => setWizardStep('upload')} />
      )}

      {wizardStep === 'upload' && (
        <UploadStep
          onParsedSuccess={(data) => {
            setParsedData(data);
            setWizardStep('mapping');
          }}
          onBackToICP={() => setWizardStep('icp')}
        />
      )}

      {wizardStep === 'mapping' && parsedData && (
        <MappingStep
          headers={parsedData.headers}
          rows={parsedData.rows}
          initialMapping={parsedData.suggestedMapping}
          fileName={parsedData.fileName}
          onBack={() => setWizardStep('upload')}
          onScoringComplete={() => {
            // State is set inside MappingStep, which triggers the results view
          }}
        />
      )}
    </div>
  );
};
