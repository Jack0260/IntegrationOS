import React, { useState } from 'react';
import { DefensiveSecurityCheck } from '../types/integration';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  Wrench,
  Lock,
} from 'lucide-react';

interface SecurityAuditorViewProps {
  checks: DefensiveSecurityCheck[];
}

export const SecurityAuditorView: React.FC<SecurityAuditorViewProps> = ({ checks }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityStyle = (sev: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950/60 border-rose-500/60 text-rose-300';
      case 'HIGH':
        return 'bg-amber-950/60 border-amber-500/60 text-amber-300';
      case 'MEDIUM':
        return 'bg-yellow-950/60 border-yellow-500/60 text-yellow-300';
      case 'LOW':
        return 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300';
    }
  };

  const detectedCount = checks.filter((c) => c.detected).length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-zinc-800 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-zinc-100 text-base">
              Defensive Security Checks
            </h3>
            <span className="text-zinc-500 font-mono text-xs">OWASP API & Cloud Hardening</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Proactive static inspection identifying weak credentials, missing TLS assumptions, excessive permissions, and PII leakage.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-zinc-400 font-mono">Vulnerabilities Detected:</span>
          <span className={`font-mono font-bold ${detectedCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {detectedCount} / {checks.length}
          </span>
        </div>
      </div>

      {/* Checks Grid */}
      <div className="space-y-3">
        {checks.map((chk) => (
          <div
            key={chk.id}
            className={`rounded-lg border p-3.5 text-xs transition-all ${
              chk.detected
                ? 'bg-zinc-950/90 border-rose-900/50 hover:border-rose-700/60'
                : 'bg-zinc-950/40 border-zinc-800/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {chk.detected ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span className="font-semibold text-zinc-100 text-sm">
                  {chk.title}
                </span>
                <span className="text-zinc-500 font-mono text-[10px]">
                  [{chk.category}]
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-bold ${getSeverityStyle(chk.severity)}`}>
                  {chk.severity}
                </span>
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                    chk.detected
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 font-bold'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {chk.detected ? 'ACTION REQUIRED' : 'COMPLIANT'}
                </span>
              </div>
            </div>

            <p className="text-zinc-300 leading-relaxed mb-3">
              {chk.explanation}
            </p>

            {/* Remediation & CLI Test */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2.5 border-t border-zinc-800/80">
              <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800/80">
                <div className="text-zinc-400 font-medium mb-1 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Defensive Remediation Recipe</span>
                </div>
                <div className="text-zinc-300 text-[11px] leading-relaxed font-mono">
                  {chk.remediationRecipe}
                </div>
              </div>

              <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800/80">
                <div className="flex items-center justify-between text-zinc-400 font-medium mb-1">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CLI / Curl Verification Command</span>
                  </div>
                  <button
                    onClick={() => handleCopy(chk.cliVerificationCommand, chk.id)}
                    className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                    title="Copy command to clipboard"
                  >
                    {copiedId === chk.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="font-mono text-[10px] text-emerald-300/90 bg-zinc-950 p-2 rounded border border-zinc-800 truncate select-all">
                  {chk.cliVerificationCommand}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
