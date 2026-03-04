'use client';

import { useState } from 'react';
import { importMatchFromJSON, validateImportJSON } from '@/lib/import/jsonImporter';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ImportMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function ImportMatchModal({ isOpen, onClose, onImported }: ImportMatchModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [result, setResult] = useState<{ success: boolean; error?: string; warnings: string[] } | null>(null);
  const [validationInfo, setValidationInfo] = useState<string>('');

  const handleValidate = () => {
    const validation = validateImportJSON(jsonText);
    if (validation.valid) {
      setValidationInfo(`Formato valido: ${validation.format === 'export' ? 'Exportacion TacticalPadel' : 'Match crudo'}`);
    } else {
      setValidationInfo(`Error: ${validation.error}`);
    }
  };

  const handleImport = () => {
    const res = importMatchFromJSON(jsonText);
    setResult(res);
    if (res.success) {
      setTimeout(() => {
        onImported();
        onClose();
      }, 1500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setJsonText(text);
      setResult(null);
      setValidationInfo('');
    };
    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Partido">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">Archivo JSON</label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="text-xs text-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/15 file:text-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">O pegar JSON directamente</label>
          <textarea
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setResult(null); setValidationInfo(''); }}
            className="w-full h-32 bg-background border border-border rounded-md p-2 text-xs font-mono resize-none"
            placeholder='{"version": "2.1", "partido": {...}}'
          />
        </div>

        {validationInfo && (
          <div className={`text-xs p-2 rounded ${validationInfo.startsWith('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {validationInfo}
          </div>
        )}

        {result && (
          <div className={`text-xs p-2 rounded ${result.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {result.success ? 'Partido importado exitosamente!' : result.error}
            {result.warnings.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-amber-400 text-[10px]">- {w}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleValidate} disabled={!jsonText}>
            Validar
          </Button>
          <Button size="sm" onClick={handleImport} disabled={!jsonText}>
            Importar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
