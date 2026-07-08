'use client';

import { useState } from 'react';
import DropZone from '@/components/DropZone';
import PreviewTable from '@/components/PreviewTable';
import ResultTable from '@/components/ResultTable';
import { ParsedRow, ImportResult } from '@/types';
import { parseCSVFile } from '@/utils/csvHelper';
import { Upload, CheckCircle, Loader2, Moon, Sun, AlertCircle, RefreshCw } from 'lucide-react';

const STEPS = ['Upload CSV', 'Preview', 'Confirm', 'Results'];

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleFileAccepted = async (file: File) => {
    setError(null);
    try {
      const { rows, headers } = await parseCSVFile(file);
      setCsvRows(rows);
      setCsvHeaders(headers);
      setStep(2);
    } catch (e: unknown) {
      setError('Failed to parse CSV: ' + (e as Error).message);
    }
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setLoadingMessage('Uploading file...');

    const messages = [
      'Uploading file...',
      'Parsing CSV structure...',
      'Sending to Gemini AI...',
      'AI is extracting CRM fields...',
      'Mapping lead data...',
      'Almost done...',
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, messages.length - 1);
      setLoadingMessage(messages[msgIdx]);
    }, 2500);

    const interval = setInterval(() => setProgress((p) => Math.min(p + 8, 88)), 600);

    try {
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((r) =>
          csvHeaders.map((h) => `"${(r[h] || '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      const formData = new FormData();
      formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'import.csv');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/parse-csv`, { method: 'POST', body: formData });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = `Server error (${res.status})`;
        try { errMsg = JSON.parse(text).error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Import failed');

      setImportResult(json.data);
      setProgress(100);
      setLoadingMessage('Complete!');
      setStep(4);
    } catch (e: unknown) {
      setError('Import failed: ' + (e as Error).message);
    } finally {
      clearInterval(interval);
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1); setCsvRows([]); setCsvHeaders([]);
    setImportResult(null); setError(null); setProgress(0); setLoadingMessage('');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Full-screen loading overlay during AI processing */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-green-100 dark:border-green-900/40" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-green-500 animate-spin" />
                  <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-green-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">Processing with Gemini AI</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 min-h-[1.25rem] transition-all">{loadingMessage}</p>
                </div>
                <div className="w-full">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-green-600 font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">This may take 10–30 seconds for large files</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GrowEasy CSV Importer</h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  step === i + 1 ? 'bg-green-500 text-white' :
                  step > i + 1 ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  {step > i + 1 && <CheckCircle className="w-3.5 h-3.5" />}
                  {label}
                </div>
                {i < 3 && <div className="w-6 h-px bg-gray-300 dark:bg-gray-700" />}
              </div>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">Something went wrong</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); if (step === 3) handleConfirmImport(); }}
                className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium transition-colors"
                title="Retry"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Upload your CSV</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Any format — Facebook Leads, Google Ads, Excel exports, or custom spreadsheets.</p>
              <DropZone onFileAccepted={handleFileAccepted} />
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preview CSV Data</h2>
                  <p className="text-gray-500 dark:text-gray-400">{csvRows.length} rows · {csvHeaders.length} columns detected</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleReset} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">← Back</button>
                  <button onClick={() => setStep(3)} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">Proceed →</button>
                </div>
              </div>
              <PreviewTable headers={csvHeaders} rows={csvRows} />
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Import</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                AI will extract CRM fields from your <span className="font-semibold text-gray-700 dark:text-gray-200">{csvRows.length} records</span>.
              </p>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md">
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      : '🚀 Confirm Import'
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && importResult && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import Complete ✅</h2>
                  <p className="text-gray-500 dark:text-gray-400">AI extraction finished</p>
                </div>
                <button onClick={handleReset} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">+ Import Another File</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Imported', value: importResult.total_imported },
                  { label: 'Total Skipped', value: importResult.total_skipped },
                  { label: 'Success Rate', value: `${Math.round((importResult.total_imported / Math.max(importResult.total_imported + importResult.total_skipped, 1)) * 100)}%` },
                  { label: 'CRM Records', value: importResult.imported.length },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                    <div className="text-sm text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <ResultTable imported={importResult.imported} skipped={importResult.skipped} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
