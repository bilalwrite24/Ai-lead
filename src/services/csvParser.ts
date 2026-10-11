import { ColumnMapping, ParsedLead, RawLeadRow, STANDARD_FIELDS, StandardLeadField } from '../types/lead';

/**
 * Robust RFC 4180 compliant CSV parser with quote, comma, semicolon, tab, and multiline support.
 */
export function parseCSVString(csvContent: string): { headers: string[]; rows: RawLeadRow[]; totalRawRows: number } {
  // Remove UTF-8 Byte Order Mark if present
  let cleanContent = csvContent.replace(/^\uFEFF/, '');
  if (!cleanContent.trim()) {
    throw new Error('The uploaded CSV file is empty.');
  }

  // Detect delimiter: inspect first line
  const firstLine = cleanContent.split(/\r\n|\n|\r/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  let delimiter = ',';
  if (semiCount > commaCount && semiCount > tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t';
  }

  const rawGrid: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;
  const len = cleanContent.length;

  while (i < len) {
    const char = cleanContent[i];
    const nextChar = cleanContent[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted string
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((val) => val.length > 0)) {
          rawGrid.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((val) => val.length > 0)) {
          rawGrid.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  // Last row if not ended with newline
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((val) => val.length > 0)) {
      rawGrid.push(currentRow);
    }
  }

  if (rawGrid.length === 0) {
    throw new Error('No readable data rows found in the CSV file.');
  }

  const rawHeaders = rawGrid[0].map((h) => h.trim().replace(/^["']|["']$/g, ''));
  if (rawHeaders.length === 0 || rawHeaders.every((h) => !h)) {
    throw new Error('Could not identify valid headers in the first row of the CSV.');
  }

  const dataRows: RawLeadRow[] = [];
  for (let rowIndex = 1; rowIndex < rawGrid.length; rowIndex++) {
    const cells = rawGrid[rowIndex];
    // Check if row is not purely empty
    if (!cells.some((c) => c && c.trim().length > 0)) {
      continue;
    }

    const rowObj: RawLeadRow = {
      _rowId: `row_${rowIndex}`,
    };

    rawHeaders.forEach((header, colIndex) => {
      rowObj[header] = cells[colIndex] !== undefined ? cells[colIndex] : '';
    });

    dataRows.push(rowObj);
  }

  return {
    headers: rawHeaders,
    rows: dataRows,
    totalRawRows: dataRows.length,
  };
}

/**
 * Intelligently suggests column mapping based on standard field aliases.
 */
export function suggestColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};

  headers.forEach((header) => {
    const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    let matchedField: StandardLeadField | 'ignore' = 'ignore';

    for (const field of STANDARD_FIELDS) {
      const isAliasMatch = field.aliases.some((alias) => {
        const cleanAlias = alias.toLowerCase();
        return cleanHeader === cleanAlias || cleanHeader.includes(cleanAlias) || cleanAlias.includes(cleanHeader);
      });

      if (isAliasMatch) {
        matchedField = field.key;
        break;
      }
    }

    mapping[header] = matchedField;
  });

  return mapping;
}

/**
 * Normalizes headcount/employee count string into integer.
 * Handles: "120", "50-100" (takes median or high), "1,000", "500+ employees", "10 to 50".
 */
export function parseEmployeeCount(value: string | undefined): { count: number | null; raw: string } {
  if (!value) return { count: null, raw: '' };
  const raw = value.trim();
  if (!raw) return { count: null, raw: '' };

  // Remove commas
  const cleaned = raw.replace(/,/g, '');

  // Look for range e.g. "50-100" or "50 - 200"
  const rangeMatch = cleaned.match(/(\d+)\s*[-–to]+\s*(\d+)/i);
  if (rangeMatch) {
    const low = parseInt(rangeMatch[1], 10);
    const high = parseInt(rangeMatch[2], 10);
    if (!isNaN(low) && !isNaN(high)) {
      return { count: Math.round((low + high) / 2), raw };
    }
  }

  // Look for plus e.g. "500+"
  const plusMatch = cleaned.match(/(\d+)\s*\+/);
  if (plusMatch) {
    const num = parseInt(plusMatch[1], 10);
    if (!isNaN(num)) return { count: num, raw };
  }

  // Extract first sequence of digits
  const singleMatch = cleaned.match(/\d+/);
  if (singleMatch) {
    const num = parseInt(singleMatch[0], 10);
    if (!isNaN(num)) return { count: num, raw };
  }

  return { count: null, raw };
}

/**
 * Maps raw CSV rows into standardized parsed leads.
 */
export function transformRowsToParsedLeads(
  rows: RawLeadRow[],
  mapping: ColumnMapping
): ParsedLead[] {
  return rows.map((row, index) => {
    const rawRecord: Record<string, string> = { ...row };
    delete rawRecord._rowId;

    let companyName = '';
    let contactName = '';
    let jobTitle = '';
    let email = '';
    let industry = '';
    let country = '';
    let rawEmployeeStr = '';
    let website = '';
    let companyType = '';
    let notes = '';

    // Invert mapping for quick lookup
    Object.entries(mapping).forEach(([csvHeader, standardField]) => {
      const val = (row[csvHeader] || '').trim();
      if (!val || standardField === 'ignore') return;

      switch (standardField) {
        case 'companyName':
          if (!companyName) companyName = val;
          break;
        case 'contactName':
          if (!contactName) contactName = val;
          break;
        case 'jobTitle':
          if (!jobTitle) jobTitle = val;
          break;
        case 'email':
          if (!email) email = val;
          break;
        case 'industry':
          if (!industry) industry = val;
          break;
        case 'country':
          if (!country) country = val;
          break;
        case 'employeeCount':
          if (!rawEmployeeStr) rawEmployeeStr = val;
          break;
        case 'website':
          if (!website) website = val;
          break;
        case 'companyType':
          if (!companyType) companyType = val;
          break;
        case 'notes':
          notes = notes ? `${notes} | ${val}` : val;
          break;
      }
    });

    const parsedCount = parseEmployeeCount(rawEmployeeStr);

    return {
      id: `lead_${index + 1}_${Date.now()}`,
      originalRowIndex: index + 1,
      companyName,
      contactName,
      jobTitle,
      email,
      industry,
      country,
      employeeCount: parsedCount.count,
      rawEmployeeCountString: parsedCount.raw,
      website,
      companyType,
      notes,
      rawRecord,
    };
  });
}

/**
 * Exports data to CSV string with proper quotes escaping.
 */
export function generateCSVContent(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const escapeCell = (cell: string | number | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCell).join(','));

  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Trigger file download directly in browser.
 */
export function downloadCSVFile(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
