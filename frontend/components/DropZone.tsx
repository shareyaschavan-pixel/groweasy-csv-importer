'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
}

export default function DropZone({ onFileAccepted }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        alert('Please upload a .csv file');
        return;
      }
      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      className={`relative border-2 border-dashed rounded-2xl p-20 text-center transition-all duration-200 cursor-pointer ${
        dragOver
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
          : 'border-gray-300 dark:border-gray-700 hover:border-green-400 hover:bg-gray-50 dark:hover:bg-gray-900'
      }`}
    >
      <input type="file" accept=".csv,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${ dragOver ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-800' }`}>
          <Upload className={`w-8 h-8 ${dragOver ? 'text-white' : 'text-gray-400'}`} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{dragOver ? 'Drop it here!' : 'Drag & drop your CSV here'}</p>
          <p className="text-gray-400 mt-1">or click to browse files</p>
        </div>
        <p className="text-xs text-gray-400">Supports any CSV — Facebook, Google Ads, Excel, custom sheets</p>
      </div>
    </div>
  );
}
