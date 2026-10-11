import { downloadCSVFile } from './csvParser';

/**
 * Fictional demonstration records for testing LeadFit AI.
 * Explicitly fictional and synthetic. Never represented as actual prospects.
 */
export const SAMPLE_PROSPECTS_CSV = `Company Name,Contact Name,Job Title,Email,Industry,Country,Employee Count,Website,Company Type,Notes
ApexMetrics Cloud,Sarah Jenkins,VP of Sales,sarah.jenkins@apexmetrics.io,SaaS,United States,120,https://apexmetrics.io,B2B SaaS,Fast-growing analytics platform for revenue teams
HyperScale Systems,Marcus Vance,Chief Revenue Officer,m.vance@hyperscale-systems.com,Cloud Services,United States,340,https://hyperscale-systems.com,B2B SaaS,Series B funded cloud infrastructure scaleup
NovaFlow Labs,Elena Rostova,Head of Sales,elena@novaflowlabs.co,Software,United Kingdom,85,https://novaflowlabs.co,Private,Workflow automation for remote marketing teams
DataPulse HQ,David Chen,Founder & CEO,david@datapulsehq.com,Information Technology,Canada,45,https://datapulsehq.com,VC Funded,Seed stage B2B customer telemetry tools
StrataSphere Analytics,Rachel Green,Director of Revenue Operations,rachel@stratapanalytics.com,SaaS,,160,https://stratapanalytics.com,B2B SaaS,Country omitted in source database
Veloce Logic,Aiden Thorne,VP Growth & Partnerships,aiden@velocelogic.io,Enterprise Software,Germany,650,https://velocelogic.io,Scaleup,Headcount slightly exceeds standard 500 cap
BeaconStack Tech,Liam O'Connor,Sales Lead,liam.oconnor@beaconstack.com,Cloud Services,Australia,,https://beaconstack.com,B2B SaaS,Headcount not reported in directory
Synthex Digital,Maya Lin,Head of Growth,mayalin92@gmail.com,Software,United States,35,https://synthexdigital.com,Startup,Uses personal webmail address instead of corporate
Sunrise Artisan Bakery,Thomas Miller,Head Baker & Owner,thomas@sunrisebakery.local,Food & Beverage,United States,4,https://sunrisecakes.local,Sole Proprietorship,Local retail neighborhood bake shop
Titan Heavy Construction,Jack Kowalski,Job Site Foreman,jack@titanheavybuild.com,Construction,United States,18,https://titanheavybuild.com,Contractor,Residential concrete foundation contractor
ApexMetrics Cloud,Sarah Jenkins,VP of Sales,sarah.jenkins@apexmetrics.io,SaaS,United States,120,https://apexmetrics.io,B2B SaaS,Duplicate row for testing deduplication engine
ClearBlue Dental Care,Emily Watson,Office Receptionist,emily@clearbluedental.net,Healthcare Services,Canada,6,https://clearbluedental.net,Private Clinic,Dental clinic front office`;

export function downloadSampleProspectsCSV(): void {
  downloadCSVFile('leadfit_sample_fictional_prospects.csv', SAMPLE_PROSPECTS_CSV);
}
