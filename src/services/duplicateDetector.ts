import { ParsedLead } from '../types/lead';

/**
 * Detects duplicate prospect entries based on normalized email (primary)
 * or company + contact name combination (fallback).
 */
export function detectDuplicates(leads: ParsedLead[]): ParsedLead[] {
  const seenEmails = new Map<string, number>();
  const seenCompanyContact = new Map<string, number>();

  return leads.map((lead, index) => {
    const normalizedEmail = (lead.email || '').trim().toLowerCase();
    const normalizedCompany = (lead.companyName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedContact = (lead.contactName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const companyContactKey = normalizedCompany && normalizedContact ? `${normalizedCompany}:::${normalizedContact}` : '';

    let isDuplicate = false;
    let duplicateReason = '';

    // Check email uniqueness first if valid email is present
    if (normalizedEmail && normalizedEmail.includes('@')) {
      if (seenEmails.has(normalizedEmail)) {
        const firstRow = seenEmails.get(normalizedEmail)!;
        isDuplicate = true;
        duplicateReason = `Duplicate email (${lead.email}) previously seen in row #${firstRow}`;
      } else {
        seenEmails.set(normalizedEmail, lead.originalRowIndex);
      }
    }

    // Check company + contact key if not already marked duplicate
    if (!isDuplicate && companyContactKey) {
      if (seenCompanyContact.has(companyContactKey)) {
        const firstRow = seenCompanyContact.get(companyContactKey)!;
        isDuplicate = true;
        duplicateReason = `Duplicate lead: ${lead.contactName || 'Contact'} at ${lead.companyName} previously seen in row #${firstRow}`;
      } else {
        seenCompanyContact.set(companyContactKey, lead.originalRowIndex);
      }
    }

    return {
      ...lead,
      isDuplicate,
      duplicateReason,
    };
  });
}
