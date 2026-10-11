import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { DEFAULT_ICP_PRESET, ICPCriteria, SAMPLE_ICP_PRESETS } from '../types/icp';
import { QualificationStatus, ScoredLead } from '../types/lead';
import { AgencySettings, QualificationBatchMetrics, QualificationSession } from '../types/session';

export type ActiveNavTab = 'dashboard' | 'qualification' | 'history' | 'settings';

interface AppContextType {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  // ICP
  activeICP: ICPCriteria;
  setActiveICP: (icp: ICPCriteria) => void;
  updateActiveICP: (updates: Partial<ICPCriteria>) => void;
  savedICPs: ICPCriteria[];
  saveICPProfile: (icp: ICPCriteria) => void;
  deleteICPProfile: (id: string) => void;
  // Current batch
  currentBatchLeads: ScoredLead[];
  setCurrentBatchLeads: (leads: ScoredLead[]) => void;
  currentBatchName: string;
  setCurrentBatchName: (name: string) => void;
  currentFileName: string;
  setCurrentFileName: (fileName: string) => void;
  updateLeadStatus: (leadId: string, newStatus: QualificationStatus, manualNotes?: string) => void;
  // Sessions & History
  sessions: QualificationSession[];
  saveCurrentAsSession: (customName?: string) => QualificationSession | null;
  loadSession: (session: QualificationSession) => void;
  deleteSession: (sessionId: string) => void;
  clearCurrentBatch: () => void;
  // Global Metrics
  globalMetrics: QualificationBatchMetrics;
  // Settings
  agencySettings: AgencySettings;
  updateAgencySettings: (updates: Partial<AgencySettings>) => void;
  // Modals & Panels
  inspectLead: ScoredLead | null;
  setInspectLead: (lead: ScoredLead | null) => void;
  outreachLead: ScoredLead | null;
  setOutreachLead: (lead: ScoredLead | null) => void;
  // Toast notifications
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const STORAGE_KEYS = {
  ICP_LIST: 'leadfit_saved_icps_v1',
  ACTIVE_ICP: 'leadfit_active_icp_v1',
  SESSIONS: 'leadfit_sessions_v1',
  AGENCY: 'leadfit_agency_settings_v1',
};

const DEFAULT_AGENCY_SETTINGS: AgencySettings = {
  agencyName: 'Vanguard Growth Partners',
  senderName: 'Jordan Reed',
  senderTitle: 'B2B Sales Operations Director',
  senderEmail: 'jordan@vanguardgrowth.agency',
  defaultExportIncludeReasons: true,
  defaultExportIncludeBreakdown: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  // Load Saved ICPs
  const [savedICPs, setSavedICPs] = useState<ICPCriteria[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ICP_LIST);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return SAMPLE_ICP_PRESETS;
  });

  // Active ICP
  const [activeICP, setActiveICP] = useState<ICPCriteria>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ICP);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_ICP_PRESET;
  });

  // Agency Settings
  const [agencySettings, setAgencySettings] = useState<AgencySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AGENCY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_AGENCY_SETTINGS;
  });

  // History sessions
  const [sessions, setSessions] = useState<QualificationSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  });

  // Current working batch state
  const [currentBatchLeads, setCurrentBatchLeads] = useState<ScoredLead[]>([]);
  const [currentBatchName, setCurrentBatchName] = useState<string>('Prospect Batch');
  const [currentFileName, setCurrentFileName] = useState<string>('');

  // Modals & Drawers
  const [inspectLead, setInspectLead] = useState<ScoredLead | null>(null);
  const [outreachLead, setOutreachLead] = useState<ScoredLead | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ICP_LIST, JSON.stringify(savedICPs));
    } catch (e) {
      console.warn('Could not persist ICPs to local storage', e);
    }
  }, [savedICPs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ICP, JSON.stringify(activeICP));
    } catch (e) {
      console.warn('Could not persist active ICP to local storage', e);
    }
  }, [activeICP]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENCY, JSON.stringify(agencySettings));
    } catch (e) {
      console.warn('Could not persist agency settings to local storage', e);
    }
  }, [agencySettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Could not persist sessions to local storage', e);
    }
  }, [sessions]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  const updateActiveICP = (updates: Partial<ICPCriteria>) => {
    setActiveICP((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const saveICPProfile = (icp: ICPCriteria) => {
    setSavedICPs((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === icp.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = icp;
        return copy;
      }
      return [...prev, icp];
    });
    setActiveICP(icp);
    showToast(`Saved ICP profile "${icp.name}"`, 'success');
  };

  const deleteICPProfile = (id: string) => {
    setSavedICPs((prev) => prev.filter((item) => item.id !== id));
    showToast('ICP profile removed', 'info');
  };

  const updateAgencySettings = (updates: Partial<AgencySettings>) => {
    setAgencySettings((prev) => ({ ...prev, ...updates }));
    showToast('Settings updated successfully', 'success');
  };

  const updateLeadStatus = (leadId: string, newStatus: QualificationStatus, manualNotes?: string) => {
    setCurrentBatchLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const updated = {
            ...lead,
            qualificationStatus: newStatus,
            manualOverrideStatus: newStatus,
            manualNotes: manualNotes !== undefined ? manualNotes : lead.manualNotes,
          };
          if (inspectLead?.id === leadId) {
            setInspectLead(updated);
          }
          return updated;
        }
        return lead;
      })
    );
    showToast(`Lead status updated to ${newStatus.replace('_', ' ')}`, 'info');
  };

  const calculateBatchMetrics = (leads: ScoredLead[]): QualificationBatchMetrics => {
    if (leads.length === 0) {
      return {
        totalLeads: 0,
        qualifiedCount: 0,
        needsReviewCount: 0,
        notQualifiedCount: 0,
        duplicateCount: 0,
        averageScore: 0,
        topIndustries: [],
        qualificationRate: 0,
      };
    }

    const totalLeads = leads.length;
    const qualifiedCount = leads.filter((l) => l.qualificationStatus === 'QUALIFIED').length;
    const needsReviewCount = leads.filter((l) => l.qualificationStatus === 'NEEDS_REVIEW').length;
    const notQualifiedCount = leads.filter((l) => l.qualificationStatus === 'NOT_QUALIFIED').length;
    const duplicateCount = leads.filter((l) => l.isDuplicate).length;
    const totalScore = leads.reduce((acc, l) => acc + l.fitScore, 0);
    const averageScore = Math.round(totalScore / totalLeads);

    const industryMap: Record<string, number> = {};
    leads.forEach((l) => {
      const ind = l.industry || 'Unspecified';
      industryMap[ind] = (industryMap[ind] || 0) + 1;
    });

    const topIndustries = Object.entries(industryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const qualificationRate = totalLeads > 0 ? Math.round((qualifiedCount / totalLeads) * 100) : 0;

    return {
      totalLeads,
      qualifiedCount,
      needsReviewCount,
      notQualifiedCount,
      duplicateCount,
      averageScore,
      topIndustries,
      qualificationRate,
    };
  };

  const saveCurrentAsSession = (customName?: string): QualificationSession | null => {
    if (currentBatchLeads.length === 0) return null;

    const metrics = calculateBatchMetrics(currentBatchLeads);
    const newSession: QualificationSession = {
      id: `session_${Date.now()}`,
      name: customName || currentBatchName || `Batch ${new Date().toLocaleDateString()}`,
      fileName: currentFileName || 'leads.csv',
      createdAt: new Date().toISOString(),
      icp: activeICP,
      leads: currentBatchLeads,
      metrics,
    };

    setSessions((prev) => [newSession, ...prev]);
    showToast(`Session "${newSession.name}" saved to history`, 'success');
    return newSession;
  };

  const loadSession = (session: QualificationSession) => {
    setCurrentBatchLeads(session.leads);
    setCurrentBatchName(session.name);
    setCurrentFileName(session.fileName);
    setActiveICP(session.icp);
    setActiveTab('qualification');
    showToast(`Loaded session: ${session.name}`, 'info');
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('Session removed from history', 'info');
  };

  const clearCurrentBatch = () => {
    setCurrentBatchLeads([]);
    setCurrentBatchName('New Batch');
    setCurrentFileName('');
    setInspectLead(null);
    setOutreachLead(null);
  };

  // Compute global metrics across either active batch or aggregate past sessions
  const globalMetrics = useMemo(() => {
    if (currentBatchLeads.length > 0) {
      return calculateBatchMetrics(currentBatchLeads);
    }
    // If no active batch, sum past sessions or return zeros for fresh user
    if (sessions.length > 0) {
      let total = 0;
      let qual = 0;
      let review = 0;
      let rejected = 0;
      let duplicates = 0;
      let scoreSum = 0;

      sessions.forEach((s) => {
        total += s.metrics.totalLeads;
        qual += s.metrics.qualifiedCount;
        review += s.metrics.needsReviewCount;
        rejected += s.metrics.notQualifiedCount;
        duplicates += s.metrics.duplicateCount;
        scoreSum += s.metrics.averageScore * s.metrics.totalLeads;
      });

      return {
        totalLeads: total,
        qualifiedCount: qual,
        needsReviewCount: review,
        notQualifiedCount: rejected,
        duplicateCount: duplicates,
        averageScore: total > 0 ? Math.round(scoreSum / total) : 0,
        topIndustries: [],
        qualificationRate: total > 0 ? Math.round((qual / total) * 100) : 0,
      };
    }

    return {
      totalLeads: 0,
      qualifiedCount: 0,
      needsReviewCount: 0,
      notQualifiedCount: 0,
      duplicateCount: 0,
      averageScore: 0,
      topIndustries: [],
      qualificationRate: 0,
    };
  }, [currentBatchLeads, sessions]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeICP,
        setActiveICP,
        updateActiveICP,
        savedICPs,
        saveICPProfile,
        deleteICPProfile,
        currentBatchLeads,
        setCurrentBatchLeads,
        currentBatchName,
        setCurrentBatchName,
        currentFileName,
        setCurrentFileName,
        updateLeadStatus,
        sessions,
        saveCurrentAsSession,
        loadSession,
        deleteSession,
        clearCurrentBatch,
        globalMetrics,
        agencySettings,
        updateAgencySettings,
        inspectLead,
        setInspectLead,
        outreachLead,
        setOutreachLead,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
