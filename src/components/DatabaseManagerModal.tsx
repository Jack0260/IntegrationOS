import React, { useState, useEffect } from 'react';
import {
  CustomerProfile,
} from '../types/integration';
import {
  exportDatabaseBackup,
  importDatabaseBackup,
  resetDatabaseToDefaults,
  getEvaluationsFromDb,
  EvaluationRecord,
} from '../db/integrationDb';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  HardDrive,
  FileJson,
  Layers,
  History,
} from 'lucide-react';

interface DatabaseManagerModalProps {
  profiles: CustomerProfile[];
  onProfilesUpdated: (profiles: CustomerProfile[]) => void;
  onClose: () => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  profiles,
  onProfilesUpdated,
  onClose,
}) => {
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit_log'>('overview');

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    const list = await getEvaluationsFromDb();
    setEvaluations(list);
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportDatabaseBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IntegrationOS_DB_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Database exported successfully as JSON file.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Export failed.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const newProfiles = await importDatabaseBackup(text);
        onProfilesUpdated(newProfiles);
        await loadEvaluations();
        setStatusMessage(`Database successfully restored with ${newProfiles.length} profiles!`);
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (err: any) {
        setStatusMessage(`Import failed: ${err?.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = async () => {
    if (confirm('Reset database to default pre-loaded enterprise profiles? This will overwrite local changes.')) {
      const reset = await resetDatabaseToDefaults();
      onProfilesUpdated(reset);
      await loadEvaluations();
      setStatusMessage('Database successfully reset to default profiles.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">
              Persistent Database Management (IndexedDB)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mx-4 mt-3 p-2.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 p-3 bg-zinc-900 border-b border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Database Status & Stores
          </button>
          <button
            onClick={() => setActiveTab('audit_log')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'audit_log' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Readiness Audit Ledger ({evaluations.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-zinc-300">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Storage Health */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px] font-mono uppercase mb-0.5">Database Engine</div>
                  <div className="font-bold text-zinc-200 text-sm flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>IndexedDB v1</span>
                  </div>
                  <div className="text-zinc-500 text-[10px] mt-1 font-mono">Store: IntegrationOS_DB</div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px] font-mono uppercase mb-0.5">Customer Profiles</div>
                  <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{profiles.length} Profiles Saved</span>
                  </div>
                  <div className="text-zinc-500 text-[10px] mt-1 font-mono">Persistent Local Store</div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px] font-mono uppercase mb-0.5">Evaluation Snapshots</div>
                  <div className="font-bold text-cyan-400 text-sm flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>{evaluations.length} Audit Records</span>
                  </div>
                  <div className="text-zinc-500 text-[10px] mt-1 font-mono">Historical Ledger</div>
                </div>
              </div>

              {/* Object Stores Breakdown */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5">
                <div className="font-semibold text-zinc-200 text-xs mb-2">Active Object Stores in Database</div>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800">
                    <div>
                      <span className="text-emerald-400 font-bold">profiles</span>
                      <span className="text-zinc-500 text-[10px] ml-2">(keyPath: "id")</span>
                    </div>
                    <span className="text-zinc-300">{profiles.length} documents</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800">
                    <div>
                      <span className="text-cyan-400 font-bold">evaluations</span>
                      <span className="text-zinc-500 text-[10px] ml-2">(indexes: profileId, timestamp)</span>
                    </div>
                    <span className="text-zinc-300">{evaluations.length} records</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800">
                    <div>
                      <span className="text-indigo-400 font-bold">custom_changes</span>
                      <span className="text-zinc-500 text-[10px] ml-2">(keyPath: "id")</span>
                    </div>
                    <span className="text-zinc-300">Active</span>
                  </div>
                </div>
              </div>

              {/* Database Actions */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5">
                <div className="font-semibold text-zinc-200 text-xs mb-2.5">Database Actions & Portability</div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleExportBackup}
                    className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export JSON Backup</span>
                  </button>

                  <label className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors font-medium cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Import JSON Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleResetToDefaults}
                    className="px-3 py-1.5 rounded-md bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-900/60 flex items-center gap-1.5 transition-colors font-medium ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Database Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit_log' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400">
                Persistent audit trail of all readiness evaluations and friction calculations recorded in the database.
              </div>

              {evaluations.length === 0 ? (
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-center">
                  No evaluation history recorded yet. Historical snapshots are automatically saved upon assessment runs.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 text-zinc-400 font-mono border-b border-zinc-800">
                      <tr>
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">Customer Profile</th>
                        <th className="py-2 px-3">Readiness Status</th>
                        <th className="py-2 px-3">Friction Score</th>
                        <th className="py-2 px-3">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
                      {evaluations.slice(0, 15).map((ev) => (
                        <tr key={ev.id} className="hover:bg-zinc-900/30">
                          <td className="py-2.5 px-3 font-mono text-zinc-400 text-[11px]">
                            {new Date(ev.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-zinc-200">
                            {ev.profileName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            <span
                              className={`px-1.5 py-0.5 rounded border ${
                                ev.status === 'READY'
                                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                  : ev.status === 'READY WITH CONDITIONS'
                                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                                  : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                              }`}
                            >
                              {ev.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-300 font-bold">
                            {ev.overallFrictionScore}/100
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400">
                            {ev.confidencePercentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
