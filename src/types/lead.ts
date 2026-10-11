export type StandardLeadField =
  | 'companyName'
  | 'website'
  | 'industry'
  | 'country'
  | 'employeeCount'
  | 'contactName'
  | 'jobTitle'
  | 'email'
  | 'companyType'
  | 'notes';

export interface FieldDefinition {
  key: StandardLeadField;
  label: string;
  required: boolean;
  description: string;
  aliases: string[];
}

export const STANDARD_FIELDS: FieldDefinition[] = [
  {
    key: 'companyName',
    label: 'Company Name',
    required: true,
    description: 'Name of the prospective organization',
    aliases: ['company', 'company name', 'organization', 'account', 'business', 'company_name', 'account name'],
  },
  {
    key: 'contactName',
    label: 'Contact Name',
    required: false,
    description: 'Full name of the decision maker',
    aliases: ['contact name', 'contact', 'full name', 'name', 'person', 'lead name', 'contact_name', 'first name', 'first_name'],
  },
  {
    key: 'jobTitle',
    label: 'Job Title',
    required: false,
    description: 'Professional role or seniority',
    aliases: ['job title', 'title', 'position', 'role', 'job_title', 'designation', 'headline'],
  },
  {
    key: 'email',
    label: 'Email',
    required: false,
    description: 'Direct or corporate email address',
    aliases: ['email', 'email address', 'contact email', 'work email', 'e-mail', 'mail', 'business email'],
  },
  {
    key: 'industry',
    label: 'Industry',
    required: false,
    description: 'Industry vertical or business sector',
    aliases: ['industry', 'sector', 'vertical', 'business category', 'market', 'industry category'],
  },
  {
    key: 'country',
    label: 'Country / Location',
    required: false,
    description: 'Geographic headquarters or location',
    aliases: ['country', 'location', 'region', 'headquarters', 'nation', 'geo', 'state/country', 'hq country'],
  },
  {
    key: 'employeeCount',
    label: 'Employee Count',
    required: false,
    description: 'Company size or headcount range',
    aliases: ['employee count', 'employees', 'company size', 'size', 'headcount', 'staff count', 'num employees', 'team size'],
  },
  {
    key: 'website',
    label: 'Website',
    required: false,
    description: 'Company website URL or domain',
    aliases: ['website', 'company website', 'url', 'domain', 'web', 'site', 'homepage'],
  },
  {
    key: 'companyType',
    label: 'Company Type',
    required: false,
    description: 'Business model, funding stage, or structure',
    aliases: ['company type', 'type', 'funding stage', 'ownership', 'business model', 'category', 'stage'],
  },
  {
    key: 'notes',
    label: 'Notes / Description',
    required: false,
    description: 'Additional context or overview',
    aliases: ['notes', 'description', 'summary', 'about', 'bio', 'overview'],
  },
];

export type ColumnMapping = Record<string, StandardLeadField | 'ignore'>;

export interface RawLeadRow {
  _rowId: string;
  [key: string]: string;
}

export interface ParsedLead {
  id: string;
  originalRowIndex: number;
  companyName: string;
  contactName: string;
  jobTitle: string;
  email: string;
  industry: string;
  country: string;
  employeeCount: number | null;
  rawEmployeeCountString: string;
  website: string;
  companyType: string;
  notes: string;
  rawRecord: Record<string, string>;
  isDuplicate?: boolean;
  duplicateReason?: string;
}

export type QualificationStatus = 'QUALIFIED' | 'NEEDS_REVIEW' | 'NOT_QUALIFIED';

export type CriterionMatchStatus = 'MATCH' | 'PARTIAL' | 'MISSING' | 'MISMATCH';

export interface CriterionResult {
  criterion: 'industry' | 'jobTitle' | 'employeeCount' | 'country' | 'companyType' | 'additional';
  name: string;
  matchStatus: CriterionMatchStatus;
  pointsEarned: number;
  maxPoints: number;
  inputValue: string;
  targetCriteria: string;
  explanation: string;
}

export interface ScoredLead extends ParsedLead {
  fitScore: number; // 0 to 100
  qualificationStatus: QualificationStatus;
  criteriaResults: CriterionResult[];
  primaryReason: string;
  positiveHighlights: string[];
  flagsOrGaps: string[];
  manualOverrideStatus?: QualificationStatus;
  manualNotes?: string;
}

export interface LeadFilterState {
  searchQuery: string;
  status: 'ALL' | QualificationStatus;
  industry: string;
  country: string;
  scoreRange: [number, number]; // e.g. [0, 100]
  showDuplicatesOnly: boolean;
  hasMissingDataOnly: boolean;
}

export interface SortState {
  column: 'companyName' | 'contactName' | 'jobTitle' | 'industry' | 'country' | 'fitScore' | 'qualificationStatus';
  direction: 'asc' | 'desc';
}
