export type OutreachFramework =
  | 'pain_point_agitate'
  | 'direct_value'
  | 'peer_case_study'
  | 'quick_question';

export interface OutreachTemplate {
  id: OutreachFramework;
  name: string;
  badge: string;
  description: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

export interface OutreachDraft {
  leadId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  jobTitle: string;
  framework: OutreachFramework;
  subject: string;
  body: string;
  generatedAt: string;
  isAiEnhanced?: boolean;
}
