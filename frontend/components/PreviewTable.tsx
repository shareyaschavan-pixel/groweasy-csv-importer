'use client';

import { ParsedRow } from '@/types';

interface PreviewTableProps {
  headers: string[];
  rows: ParsedRow[];
}

export default function PreviewTable({ headers, rows }: PreviewTableProps) {
  const preview = rows.slice(0, 100);
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between text-sm text-gray-500">
        <span>Showing {preview.length} of {rows.length} rows</span>
        <span>{headers.length} columns</span>
      </div>
      <div className="overflow-auto max-h-[480px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 dark:border-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {preview.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {headers.map((h, j) => (
                  <td key={j} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[180px] truncate">
                    {row[h] || <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
