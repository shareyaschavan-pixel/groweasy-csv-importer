import Papa from 'papaparse';
import { ParsedRow } from '@/types';

export function parseCSVFile(file: File): Promise<{ rows: ParsedRow[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({ rows: results.data as ParsedRow[], headers });
      },
      error: reject,
    });
  });
}
