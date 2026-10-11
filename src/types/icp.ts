export interface ICPWeights {
  industry: number;      // e.g. 25%
  jobTitle: number;      // e.g. 25%
  employeeCount: number; // e.g. 20%
  country: number;       // e.g. 15%
  companyType: number;   // e.g. 15%
}

export interface ICPThresholds {
  qualified: number;   // >= 70
  needsReview: number; // >= 40 and < 70
  // < 40 is Not Qualified
}

export interface ICPCriteria {
  id: string;
  name: string;
  targetIndustries: string[];
  targetCountries: string[];
  minEmployees: number | null;
  maxEmployees: number | null;
  targetJobTitles: string[];
  targetCompanyTypes: string[];
  additionalRequirements: string;
  weights: ICPWeights;
  thresholds: ICPThresholds;
  requireBusinessEmail?: boolean;
  requireWebsite?: boolean;
}

export const DEFAULT_WEIGHTS: ICPWeights = {
  industry: 25,
  jobTitle: 25,
  employeeCount: 20,
  country: 15,
  companyType: 15,
};

export const DEFAULT_THRESHOLDS: ICPThresholds = {
  qualified: 70,
  needsReview: 40,
};

export const DEFAULT_ICP_PRESET: ICPCriteria = {
  id: 'icp_b2b_saas_midmarket',
  name: 'B2B SaaS Mid-Market Leadership',
  targetIndustries: ['SaaS', 'Software', 'Cloud Services', 'Information Technology', 'Enterprise Software'],
  targetCountries: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia'],
  minEmployees: 20,
  maxEmployees: 500,
  targetJobTitles: ['VP of Sales', 'Head of Sales', 'Chief Revenue Officer', 'CRO', 'VP Revenue Operations', 'Director of Sales', 'Founder', 'CEO', 'Head of Growth'],
  targetCompanyTypes: ['B2B SaaS', 'Private', 'VC Funded', 'Series A/B/C', 'Scaleup'],
  additionalRequirements: 'Must have active web domain and professional corporate title',
  weights: DEFAULT_WEIGHTS,
  thresholds: DEFAULT_THRESHOLDS,
  requireBusinessEmail: true,
  requireWebsite: false,
};

export const SAMPLE_ICP_PRESETS: ICPCriteria[] = [
  DEFAULT_ICP_PRESET,
  {
    id: 'icp_fintech_founders',
    name: 'FinTech Founders & Seed Stage',
    targetIndustries: ['FinTech', 'Financial Services', 'Banking Technology', 'Payments'],
    targetCountries: ['United States', 'United Kingdom', 'Singapore'],
    minEmployees: 5,
    maxEmployees: 50,
    targetJobTitles: ['Founder', 'Co-Founder', 'Chief Executive Officer', 'CEO', 'Chief Technology Officer', 'CTO'],
    targetCompanyTypes: ['Seed Stage', 'Startup', 'Bootstrapped', 'VC Funded'],
    additionalRequirements: 'Founder-led teams expanding payment infrastructure',
    weights: {
      industry: 30,
      jobTitle: 30,
      employeeCount: 20,
      country: 10,
      companyType: 10,
    },
    thresholds: DEFAULT_THRESHOLDS,
    requireBusinessEmail: true,
    requireWebsite: true,
  },
  {
    id: 'icp_ecommerce_ops',
    name: 'E-commerce & D2C Operations',
    targetIndustries: ['E-commerce', 'Retail Tech', 'D2C', 'Consumer Goods'],
    targetCountries: ['United States', 'United Kingdom', 'Canada', 'France', 'Netherlands'],
    minEmployees: 15,
    maxEmployees: 300,
    targetJobTitles: ['Head of Operations', 'COO', 'Director of Supply Chain', 'VP of Logistics', 'VP Operations'],
    targetCompanyTypes: ['D2C Brand', 'Digital Native', 'Mid-Market Retailer'],
    additionalRequirements: 'Brands shipping physical goods seeking supply chain software',
    weights: {
      industry: 25,
      jobTitle: 25,
      employeeCount: 20,
      country: 15,
      companyType: 15,
    },
    thresholds: DEFAULT_THRESHOLDS,
    requireBusinessEmail: false,
    requireWebsite: false,
  },
];
