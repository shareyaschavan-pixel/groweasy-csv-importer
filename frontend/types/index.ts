export interface ParsedRow {
  [key: string]: string;
}

export interface CRMRecord {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE';
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
}

export interface SkippedRecord {
  original: Record<string, string>;
  reason: string;
}

export interface ImportResult {
  imported: CRMRecord[];
  skipped: SkippedRecord[];
  total_imported: number;
  total_skipped: number;
}
