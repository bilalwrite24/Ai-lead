import { ICPCriteria } from '../types/icp';
import { CriterionResult, ParsedLead, QualificationStatus, ScoredLead } from '../types/lead';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'mail.com',
  'aol.com',
  'zoho.com',
  'protonmail.com',
  'yandex.com',
  'gmx.com',
]);

const COUNTRY_SYNONYMS: Record<string, string[]> = {
  'united states': ['united states', 'usa', 'us', 'u.s.', 'u.s.a.', 'united states of america'],
  'united kingdom': ['united kingdom', 'uk', 'u.k.', 'great britain', 'england', 'scotland', 'wales'],
  canada: ['canada', 'ca', 'can'],
  australia: ['australia', 'au', 'aus'],
  germany: ['germany', 'de', 'deutschland'],
  france: ['france', 'fr'],
  netherlands: ['netherlands', 'holland', 'nl'],
  singapore: ['singapore', 'sg'],
  india: ['india', 'in'],
  ireland: ['ireland', 'ie'],
  sweden: ['sweden', 'se'],
  switzerland: ['switzerland', 'ch'],
};

function normalizeString(str: string): string {
  return (str || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, ' ');
}

function tokenize(str: string): string[] {
  return normalizeString(str)
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Evaluates Industry matching
 */
function evaluateIndustry(
  leadIndustry: string,
  targetIndustries: string[],
  maxPoints: number
): CriterionResult {
  const targetLabel = targetIndustries.length > 0 ? targetIndustries.join(', ') : 'Any Industry';

  if (!targetIndustries || targetIndustries.length === 0) {
    return {
      criterion: 'industry',
      name: 'Industry',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: leadIndustry || 'Not specified',
      targetCriteria: targetLabel,
      explanation: 'No industry restrictions configured in ICP (Full points awarded).',
    };
  }

  if (!leadIndustry || !leadIndustry.trim()) {
    const points = Math.round(maxPoints * 0.5);
    return {
      criterion: 'industry',
      name: 'Industry',
      matchStatus: 'MISSING',
      pointsEarned: points,
      maxPoints,
      inputValue: 'Omitted in CSV',
      targetCriteria: targetLabel,
      explanation: 'Industry omitted in prospect record (neutral score applied, unconfirmed).',
    };
  }

  const leadNorm = normalizeString(leadIndustry);
  const leadTokens = tokenize(leadIndustry);

  // Exact match
  const exactMatch = targetIndustries.some(
    (target) => normalizeString(target) === leadNorm || leadNorm.includes(normalizeString(target))
  );
  if (exactMatch) {
    return {
      criterion: 'industry',
      name: 'Industry',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: leadIndustry,
      targetCriteria: targetLabel,
      explanation: `Matches target ICP industry: "${leadIndustry}".`,
    };
  }

  // Token overlap / semantic partial
  let maxTokenOverlap = 0;
  for (const target of targetIndustries) {
    const targetTokens = tokenize(target);
    const overlap = leadTokens.filter((token) => targetTokens.includes(token)).length;
    if (overlap > maxTokenOverlap) {
      maxTokenOverlap = overlap;
    }
  }

  if (maxTokenOverlap > 0) {
    const points = Math.round(maxPoints * 0.65);
    return {
      criterion: 'industry',
      name: 'Industry',
      matchStatus: 'PARTIAL',
      pointsEarned: points,
      maxPoints,
      inputValue: leadIndustry,
      targetCriteria: targetLabel,
      explanation: `Partial industry overlap with ICP target ("${leadIndustry}").`,
    };
  }

  return {
    criterion: 'industry',
    name: 'Industry',
    matchStatus: 'MISMATCH',
    pointsEarned: 0,
    maxPoints,
    inputValue: leadIndustry,
    targetCriteria: targetLabel,
    explanation: `Industry ("${leadIndustry}") does not align with target industries (${targetLabel}).`,
  };
}

/**
 * Evaluates Job Title / Seniority
 */
function evaluateJobTitle(
  leadTitle: string,
  targetTitles: string[],
  maxPoints: number
): CriterionResult {
  const targetLabel = targetTitles.length > 0 ? targetTitles.join(', ') : 'Any Title';

  if (!targetTitles || targetTitles.length === 0) {
    return {
      criterion: 'jobTitle',
      name: 'Job Title / Role',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: leadTitle || 'Not specified',
      targetCriteria: targetLabel,
      explanation: 'No job title constraints set in ICP (Full points awarded).',
    };
  }

  if (!leadTitle || !leadTitle.trim()) {
    const points = Math.round(maxPoints * 0.45);
    return {
      criterion: 'jobTitle',
      name: 'Job Title / Role',
      matchStatus: 'MISSING',
      pointsEarned: points,
      maxPoints,
      inputValue: 'Omitted in CSV',
      targetCriteria: targetLabel,
      explanation: 'Job title missing in prospect record (neutral score applied, unconfirmed).',
    };
  }

  const titleNorm = normalizeString(leadTitle);
  const titleTokens = tokenize(leadTitle);

  // Exact match
  const exact = targetTitles.some(
    (t) => normalizeString(t) === titleNorm || titleNorm.includes(normalizeString(t))
  );
  if (exact) {
    return {
      criterion: 'jobTitle',
      name: 'Job Title / Role',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: leadTitle,
      targetCriteria: targetLabel,
      explanation: `Decision-maker title aligns with ICP target: "${leadTitle}".`,
    };
  }

  // Key seniority & departmental alignment
  const seniorityTokens = ['vp', 'vice', 'president', 'head', 'chief', 'director', 'founder', 'ceo', 'cro', 'cmo', 'coo', 'cto', 'principal', 'lead'];
  const leadHasSeniority = titleTokens.some((t) => seniorityTokens.includes(t));

  let tokenMatchCount = 0;
  for (const target of targetTitles) {
    const targetTokens = tokenize(target);
    const matches = titleTokens.filter((token) => targetTokens.includes(token)).length;
    if (matches > tokenMatchCount) {
      tokenMatchCount = matches;
    }
  }

  if (leadHasSeniority || tokenMatchCount > 0) {
    const points = Math.round(maxPoints * 0.6);
    return {
      criterion: 'jobTitle',
      name: 'Job Title / Role',
      matchStatus: 'PARTIAL',
      pointsEarned: points,
      maxPoints,
      inputValue: leadTitle,
      targetCriteria: targetLabel,
      explanation: `Title "${leadTitle}" shows relevant leadership seniority or keyword alignment.`,
    };
  }

  return {
    criterion: 'jobTitle',
    name: 'Job Title / Role',
    matchStatus: 'MISMATCH',
    pointsEarned: 0,
    maxPoints,
    inputValue: leadTitle,
    targetCriteria: targetLabel,
    explanation: `Title "${leadTitle}" does not match target roles (${targetLabel}).`,
  };
}

/**
 * Evaluates Employee Headcount
 */
function evaluateEmployeeCount(
  count: number | null,
  rawString: string,
  min: number | null,
  max: number | null,
  maxPoints: number
): CriterionResult {
  const targetLabel = `${min ?? '1'} - ${max ? `${max}` : 'Any'} employees`;

  if (min === null && max === null) {
    return {
      criterion: 'employeeCount',
      name: 'Company Headcount',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: count !== null ? `${count}` : (rawString || 'Not specified'),
      targetCriteria: 'Any Size',
      explanation: 'No headcount range defined in ICP (Full points awarded).',
    };
  }

  if (count === null) {
    const points = Math.round(maxPoints * 0.5);
    return {
      criterion: 'employeeCount',
      name: 'Company Headcount',
      matchStatus: 'MISSING',
      pointsEarned: points,
      maxPoints,
      inputValue: rawString || 'Omitted in CSV',
      targetCriteria: targetLabel,
      explanation: 'Headcount unstated in prospect record (neutral score applied, unconfirmed).',
    };
  }

  const effectiveMin = min ?? 0;
  const effectiveMax = max ?? Infinity;

  // Perfect inside range
  if (count >= effectiveMin && count <= effectiveMax) {
    return {
      criterion: 'employeeCount',
      name: 'Company Headcount',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: `${count} employees`,
      targetCriteria: targetLabel,
      explanation: `Headcount (${count}) perfectly fits the target size range (${targetLabel}).`,
    };
  }

  // Soft border buffer (within 25%)
  const lowerBuffer = effectiveMin * 0.75;
  const upperBuffer = effectiveMax === Infinity ? Infinity : effectiveMax * 1.25;

  if (count >= lowerBuffer && count <= upperBuffer) {
    const points = Math.round(maxPoints * 0.7);
    return {
      criterion: 'employeeCount',
      name: 'Company Headcount',
      matchStatus: 'PARTIAL',
      pointsEarned: points,
      maxPoints,
      inputValue: `${count} employees`,
      targetCriteria: targetLabel,
      explanation: `Headcount (${count}) is just outside target bounds (${targetLabel}) but within soft tolerance.`,
    };
  }

  return {
    criterion: 'employeeCount',
    name: 'Company Headcount',
    matchStatus: 'MISMATCH',
    pointsEarned: 0,
    maxPoints,
    inputValue: `${count} employees`,
    targetCriteria: targetLabel,
    explanation: `Headcount (${count}) is outside the target size range (${targetLabel}).`,
  };
}

/**
 * Evaluates Country / Geography
 */
function evaluateCountry(
  leadCountry: string,
  targetCountries: string[],
  maxPoints: number
): CriterionResult {
  const targetLabel = targetCountries.length > 0 ? targetCountries.join(', ') : 'Any Country';

  if (!targetCountries || targetCountries.length === 0) {
    return {
      criterion: 'country',
      name: 'Country / Geography',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: leadCountry || 'Not specified',
      targetCriteria: 'Global',
      explanation: 'No country restriction configured in ICP (Full points awarded).',
    };
  }

  if (!leadCountry || !leadCountry.trim()) {
    const points = Math.round(maxPoints * 0.5);
    return {
      criterion: 'country',
      name: 'Country / Geography',
      matchStatus: 'MISSING',
      pointsEarned: points,
      maxPoints,
      inputValue: 'Omitted in CSV',
      targetCriteria: targetLabel,
      explanation: 'Country omitted in prospect record (neutral score applied, unconfirmed).',
    };
  }

  const leadNorm = normalizeString(leadCountry);

  const isMatched = targetCountries.some((target) => {
    const targetNorm = normalizeString(target);
    if (leadNorm === targetNorm || leadNorm.includes(targetNorm) || targetNorm.includes(leadNorm)) {
      return true;
    }
    // Check known synonyms
    for (const [, synonyms] of Object.entries(COUNTRY_SYNONYMS)) {
      const matchLead = synonyms.some((s) => s === leadNorm);
      const matchTarget = synonyms.some((s) => s === targetNorm);
      if (matchLead && matchTarget) return true;
    }
    return false;
  });

  if (isMatched) {
    return {
      criterion: 'country',
      name: 'Country / Geography',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: leadCountry,
      targetCriteria: targetLabel,
      explanation: `Country "${leadCountry}" matches target ICP geography.`,
    };
  }

  return {
    criterion: 'country',
    name: 'Country / Geography',
    matchStatus: 'MISMATCH',
    pointsEarned: 0,
    maxPoints,
    inputValue: leadCountry,
    targetCriteria: targetLabel,
    explanation: `Country "${leadCountry}" is outside target geography (${targetLabel}).`,
  };
}

/**
 * Evaluates Company Type / Business Model
 */
function evaluateCompanyType(
  leadType: string,
  leadNotes: string,
  targetTypes: string[],
  maxPoints: number
): CriterionResult {
  const targetLabel = targetTypes.length > 0 ? targetTypes.join(', ') : 'Any Company Type';

  if (!targetTypes || targetTypes.length === 0) {
    return {
      criterion: 'companyType',
      name: 'Company Type / Model',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: leadType || 'Not specified',
      targetCriteria: targetLabel,
      explanation: 'No company type requirements in ICP (Full points awarded).',
    };
  }

  const combinedLeadText = `${leadType || ''} ${leadNotes || ''}`.trim();

  if (!combinedLeadText) {
    const points = Math.round(maxPoints * 0.5);
    return {
      criterion: 'companyType',
      name: 'Company Type / Model',
      matchStatus: 'MISSING',
      pointsEarned: points,
      maxPoints,
      inputValue: 'Omitted in CSV',
      targetCriteria: targetLabel,
      explanation: 'Company type not specified in CSV (neutral score applied, unconfirmed).',
    };
  }

  const normCombined = normalizeString(combinedLeadText);
  const exact = targetTypes.some((t) => normCombined.includes(normalizeString(t)));

  if (exact) {
    return {
      criterion: 'companyType',
      name: 'Company Type / Model',
      matchStatus: 'MATCH',
      pointsEarned: maxPoints,
      maxPoints,
      inputValue: leadType || 'Detected in profile',
      targetCriteria: targetLabel,
      explanation: `Company type aligns with ICP profile targets.`,
    };
  }

  const tokens = tokenize(combinedLeadText);
  let partialOverlap = false;
  for (const t of targetTypes) {
    const tTokens = tokenize(t);
    if (tokens.some((tk) => tTokens.includes(tk))) {
      partialOverlap = true;
      break;
    }
  }

  if (partialOverlap) {
    const points = Math.round(maxPoints * 0.6);
    return {
      criterion: 'companyType',
      name: 'Company Type / Model',
      matchStatus: 'PARTIAL',
      pointsEarned: points,
      maxPoints,
      inputValue: leadType || 'Detected in context',
      targetCriteria: targetLabel,
      explanation: `Contextual overlap with target company type (${targetLabel}).`,
    };
  }

  return {
    criterion: 'companyType',
    name: 'Company Type / Model',
    matchStatus: 'MISMATCH',
    pointsEarned: 0,
    maxPoints,
    inputValue: leadType || 'Unmatched',
    targetCriteria: targetLabel,
    explanation: `Company type does not match target specifications.`,
  };
}

/**
 * Evaluates Additional requirements (e.g. email domain quality, website presence, user notes)
 */
function evaluateAdditionalCriteria(
  lead: ParsedLead,
  icp: ICPCriteria
): { highlights: string[]; flags: string[]; bonusPenaltyPoints: number } {
  const highlights: string[] = [];
  const flags: string[] = [];
  let adjustment = 0;

  // Check email
  if (lead.email) {
    const parts = lead.email.toLowerCase().split('@');
    if (parts.length === 2) {
      const domain = parts[1];
      if (FREE_EMAIL_DOMAINS.has(domain)) {
        flags.push(`Personal webmail domain (@${domain}) used instead of corporate domain`);
        if (icp.requireBusinessEmail) {
          adjustment -= 8;
        }
      } else {
        highlights.push(`Corporate email domain detected (@${domain})`);
      }
    }
  } else {
    flags.push('No email address provided in prospect record');
  }

  // Check website
  if (lead.website) {
    if (lead.website.includes('.') && lead.website.length > 4) {
      highlights.push(`Company website recorded (${lead.website})`);
    }
  } else if (icp.requireWebsite) {
    flags.push('Company website omitted');
    adjustment -= 5;
  }

  // Check additional text requirement keywords if defined
  if (icp.additionalRequirements && icp.additionalRequirements.trim()) {
    const reqTokens = tokenize(icp.additionalRequirements);
    const leadCorpus = normalizeString(
      `${lead.companyName} ${lead.notes} ${lead.industry} ${lead.jobTitle}`
    );
    const matches = reqTokens.filter((token) => leadCorpus.includes(token));
    if (matches.length > 0) {
      highlights.push(`Matched custom ICP criteria keyword: "${matches[0]}"`);
      adjustment += 5;
    }
  }

  return { highlights, flags, bonusPenaltyPoints: adjustment };
}

/**
 * Scores a single parsed lead deterministically against ICP criteria.
 */
export function scoreLead(lead: ParsedLead, icp: ICPCriteria): ScoredLead {
  const totalWeight =
    icp.weights.industry +
    icp.weights.jobTitle +
    icp.weights.employeeCount +
    icp.weights.country +
    icp.weights.companyType;

  // Normalize weights so they always equal 100
  const normWeight = (w: number) => Math.round((w / (totalWeight || 100)) * 100);

  const industryWeight = normWeight(icp.weights.industry);
  const jobTitleWeight = normWeight(icp.weights.jobTitle);
  const employeeCountWeight = normWeight(icp.weights.employeeCount);
  const countryWeight = normWeight(icp.weights.country);
  const companyTypeWeight = 100 - (industryWeight + jobTitleWeight + employeeCountWeight + countryWeight);

  const criteriaResults: CriterionResult[] = [
    evaluateIndustry(lead.industry, icp.targetIndustries, industryWeight),
    evaluateJobTitle(lead.jobTitle, icp.targetJobTitles, jobTitleWeight),
    evaluateEmployeeCount(
      lead.employeeCount,
      lead.rawEmployeeCountString,
      icp.minEmployees,
      icp.maxEmployees,
      employeeCountWeight
    ),
    evaluateCountry(lead.country, icp.targetCountries, countryWeight),
    evaluateCompanyType(lead.companyType, lead.notes, icp.targetCompanyTypes, companyTypeWeight),
  ];

  const { highlights, flags, bonusPenaltyPoints } = evaluateAdditionalCriteria(lead, icp);

  // Sum base points
  const basePoints = criteriaResults.reduce((acc, c) => acc + c.pointsEarned, 0);
  const rawScore = basePoints + bonusPenaltyPoints;
  const fitScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Classify
  let qualificationStatus: QualificationStatus = 'NOT_QUALIFIED';
  if (fitScore >= icp.thresholds.qualified) {
    qualificationStatus = 'QUALIFIED';
  } else if (fitScore >= icp.thresholds.needsReview) {
    qualificationStatus = 'NEEDS_REVIEW';
  } else {
    qualificationStatus = 'NOT_QUALIFIED';
  }

  // Synthesize concise primary reason for table view
  const matches = criteriaResults.filter((c) => c.matchStatus === 'MATCH');
  const partials = criteriaResults.filter((c) => c.matchStatus === 'PARTIAL');
  const missings = criteriaResults.filter((c) => c.matchStatus === 'MISSING');
  const mismatches = criteriaResults.filter((c) => c.matchStatus === 'MISMATCH');

  let primaryReason = '';
  if (qualificationStatus === 'QUALIFIED') {
    const matchNames = matches.map((m) => m.name.split(' ')[0]).join(', ');
    primaryReason = `High fit across ${matchNames || 'core criteria'} (${fitScore}/100)`;
  } else if (qualificationStatus === 'NEEDS_REVIEW') {
    if (missings.length > 0) {
      const missingNames = missings.map((m) => m.name.split(' ')[0]).join(', ');
      primaryReason = `Requires verification: missing ${missingNames}`;
    } else if (partials.length > 0) {
      primaryReason = `Borderline alignment on ${partials[0].name}`;
    } else {
      primaryReason = `Moderate overall ICP fit (${fitScore}/100)`;
    }
  } else {
    if (mismatches.length > 0) {
      primaryReason = `ICP mismatch on ${mismatches.map((m) => m.name.split(' ')[0]).join(', ')}`;
    } else {
      primaryReason = `Low criteria compatibility (${fitScore}/100)`;
    }
  }

  return {
    ...lead,
    fitScore,
    qualificationStatus,
    criteriaResults,
    primaryReason,
    positiveHighlights: highlights,
    flagsOrGaps: flags,
  };
}

/**
 * Scores an entire list of parsed leads.
 */
export function scoreAllLeads(leads: ParsedLead[], icp: ICPCriteria): ScoredLead[] {
  return leads.map((lead) => scoreLead(lead, icp));
}
