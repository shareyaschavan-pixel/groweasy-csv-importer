'use client';

import { useState } from 'react';
import { CRMRecord, SkippedRecord } from '@/types';
import { CheckCircle, XCircle, Download } from 'lucide-react';

const CRM_FIELDS: (keyof CRMRecord)[] = [
  'created_at', 'name', 'email', 'country_code', 'mobile_without_country_code',
  'company', 'city', 'state', 'country', 'lead_owner', 'crm_status',
  'crm_note', 'data_source', 'possession_time', 'description',
];

function downloadCSV(records: CRMRecord[]) {
  const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}`;
  const header = CRM_FIELDS.join(',');
  const rows = records.map((r) => CRM_FIELDS.map((f) => escape(r[f])).join(','));
  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `groweasy-imported-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ResultTable({ imported, skipped }: { imported: CRMRecord[]; skipped: SkippedRecord[] }) {
  const [tab, setTab] = useState<'imported' | 'skipped'>('imported');

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          {(['imported', 'skipped'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? t === 'imported' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
              {t === 'imported' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {t === 'imported' ? `Imported (${imported.length})` : `Skipped (${skipped.length})`}
            </button>
          ))}
        </div>
        {tab === 'imported' && imported.length > 0 && (
          <button
            onClick={() => downloadCSV(imported)}
            className="flex items-center gap-2 mr-4 px-4 py-2 text-sm font-medium text-green-600 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        )}
      </div>
      <div className="overflow-auto max-h-[480px]">
        {tab === 'imported' && (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
              <tr>{CRM_FIELDS.map((f, i) => <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap border-b border-gray-200 dark:border-gray-700">{String(f).replace(/_/g, ' ')}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {imported.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {CRM_FIELDS.map((f, j) => <td key={j} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[180px] truncate">{String(r[f] || '') || <span className="text-gray-300">—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'skipped' && (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">Original Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {skipped.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-red-500 whitespace-nowrap">{r.reason}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono max-w-[400px] truncate">{JSON.stringify(r.original)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
