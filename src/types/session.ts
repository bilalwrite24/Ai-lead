import { ICPCriteria } from './icp';
import { ScoredLead } from './lead';

export interface QualificationBatchMetrics {
  totalLeads: number;
  qualifiedCount: number;
  needsReviewCount: number;
  notQualifiedCount: number;
  duplicateCount: number;
  averageScore: number;
  topIndustries: { name: string; count: number }[];
  qualificationRate: number; // percentage
}

export interface QualificationSession {
  id: string;
  name: string;
  fileName: string;
  createdAt: string;
  icp: ICPCriteria;
  leads: ScoredLead[];
  metrics: QualificationBatchMetrics;
}

export interface AgencySettings {
  agencyName: string;
  senderName: string;
  senderTitle: string;
  senderEmail: string;
  defaultExportIncludeReasons: boolean;
  defaultExportIncludeBreakdown: boolean;
  notificationPreferences?: {
    emailAlerts?: boolean;
  };
}
