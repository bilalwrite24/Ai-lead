import { OutreachDraft, OutreachFramework, OutreachTemplate } from '../types/outreach';
import { ScoredLead } from '../types/lead';
import { ICPCriteria } from '../types/icp';
import { AgencySettings } from '../types/session';

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'pain_point_agitate',
    name: 'Problem - Agitate - Solve (PAS)',
    badge: 'Conversion Focused',
    description: 'Pinpoints common pipeline friction for leadership and offers a clear strategic fix.',
    subjectTemplate: 'Quick question regarding {Company}\'s {Industry} pipeline',
    bodyTemplate: `Hi {FirstName},

I noticed you lead {JobTitleContext} at {Company}. Many {Industry} teams we work with are running into the same friction: outbound reps spending 60%+ of their week researching unqualified leads rather than speaking with active buyers.

When ICP criteria aren't rigorously filtered up front, sales cycles stretch and customer acquisition costs creep up.

We built an automated qualification workflow that verifies company size, tech stack, and decision-maker roles before any outreach goes out. For teams in {Industry}, this routinely lifts demo booked rates by 35%.

Would you be open to a 10-minute chat this Thursday to see how this fits {Company}\'s growth goals?

Best regards,
{SenderName}
{SenderTitle} | {SenderAgency}`,
  },
  {
    id: 'direct_value',
    name: 'Direct Value Proposition',
    badge: 'Short & Direct',
    description: 'Clean, no-fluff proposition highlighting specific ROI and time savings.',
    subjectTemplate: 'Helping {Company} qualify higher-fit {Industry} accounts',
    bodyTemplate: `Hi {FirstName},

Reaching out because {Company} came across my radar while mapping top {Industry} companies.

As {JobTitleContext}, your team's pipeline velocity hinges on targeting exact-fit prospects who actually have the budget and need for your solution.

We help B2B teams filter and score prospect lists against strict ICP parameters before any campaign launch, eliminating wasted outreach on bad-fit accounts.

Would you be open to reviewing a complimentary 50-account sample qualification report for {Company}?

Best,
{SenderName}
{SenderAgency}`,
  },
  {
    id: 'peer_case_study',
    name: 'Peer Case Study & Social Proof',
    badge: 'Evidence Based',
    description: 'Leverages industry-specific outcomes to establish immediate credibility.',
    subjectTemplate: '{Company} + ICP qualification benchmark',
    bodyTemplate: `Hi {FirstName},

Given your focus as {JobTitleContext} at {Company}, I wanted to share a quick benchmark from another {Industry} firm of similar size ({HeadcountContext}).

They were seeing high bounce and rejection rates from broad lead lists. After implementing deterministic ICP scoring across industry, headcount, and leadership roles:
- Qualified reply rates increased from 2.1% to 8.4%
- Sales development reps saved ~9 hours per week on manual list cleanup

Could I send over a 2-page brief on how they structured their ICP criteria? No strings attached.

Warmly,
{SenderName}
{SenderTitle} | {SenderAgency}`,
  },
  {
    id: 'quick_question',
    name: 'Brief Referral & Role Confirmation',
    badge: 'Low Friction',
    description: 'Low-effort prompt to confirm ownership of the B2B pipeline.',
    subjectTemplate: 'Right person for pipeline strategy at {Company}?',
    bodyTemplate: `Hi {FirstName},

I see you're {JobTitleContext} at {Company}. 

Are you the right person handling lead qualification and sales targeting strategies for your team, or should I connect with someone else on the revenue operations side?

If you are, we've developed a clean approach to ensure freelance lead generators and SDRs only touch accounts that match your exact ICP.

Worth a brief conversation next week?

Thanks,
{SenderName}
{SenderAgency}`,
  },
];

export function generateOutreachDraft(
  lead: ScoredLead,
  icp: ICPCriteria,
  framework: OutreachFramework,
  agency: AgencySettings
): OutreachDraft {
  const template = OUTREACH_TEMPLATES.find((t) => t.id === framework) || OUTREACH_TEMPLATES[0];

  const fullName = lead.contactName || 'there';
  const firstName = lead.contactName ? lead.contactName.trim().split(' ')[0] : 'there';
  const company = lead.companyName || 'your team';
  const industry = lead.industry || 'B2B';
  const jobTitleContext = lead.jobTitle || 'sales leadership';
  const headcountContext = lead.employeeCount ? `~${lead.employeeCount} team members` : 'rapidly scaling';
  const senderName = agency.senderName || 'Alex Mercer';
  const senderTitle = agency.senderTitle || 'Lead Qualification Specialist';
  const senderAgency = agency.agencyName || 'LeadFit AI Client Partner';

  const replaceTokens = (text: string) => {
    return text
      .replace(/{FirstName}/g, firstName)
      .replace(/{FullName}/g, fullName)
      .replace(/{Company}/g, company)
      .replace(/{Industry}/g, industry)
      .replace(/{JobTitleContext}/g, jobTitleContext)
      .replace(/{HeadcountContext}/g, headcountContext)
      .replace(/{SenderName}/g, senderName)
      .replace(/{SenderTitle}/g, senderTitle)
      .replace(/{SenderAgency}/g, senderAgency);
  };

  const subject = replaceTokens(template.subjectTemplate);
  const body = replaceTokens(template.bodyTemplate);

  return {
    leadId: lead.id,
    companyName: lead.companyName,
    contactName: lead.contactName,
    contactEmail: lead.email,
    jobTitle: lead.jobTitle,
    framework,
    subject,
    body,
    generatedAt: new Date().toISOString(),
    isAiEnhanced: false,
  };
}
