import React, { useState } from 'react';
import { ReadinessReport } from '../types/integration';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Terminal,
} from 'lucide-react';

interface ReadinessBannerProps {
  report: ReadinessReport;
  customerName: string;
}

export const ReadinessBanner: React.FC<ReadinessBannerProps> = ({ report, customerName }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  const statusConfig = {
    READY: {
      bg: 'bg-emerald-950/20 border-emerald-500/40',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      label: 'READY',
      sub: 'Clear to initiate pre-production handshake',
    },
    'READY WITH CONDITIONS': {
      bg: 'bg-amber-950/20 border-amber-500/40',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-900/60 border-amber-500/60 text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      label: 'READY WITH CONDITIONS',
      sub: 'Pre-flight prerequisites must be satisfied prior to cutover',
    },
    BLOCKED: {
      bg: 'bg-rose-950/20 border-rose-500/40',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-900/60 border-rose-500/60 text-rose-300',
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      label: 'BLOCKED',
      sub: 'Critical architectural or security blockers detected',
    },
  }[report.status];

  return (
    <div className={`rounded-xl border ${statusConfig.bg} p-4 sm:p-5 transition-all shadow-sm`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Signature Readiness Verdict */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="mt-0.5 sm:mt-0 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
            {statusConfig.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono">
                5-Minute Integration Readiness Report
              </span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400 font-medium">{customerName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className={`text-xl sm:text-2xl font-bold tracking-tight font-mono ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                {statusConfig.sub}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Key Delivery Metrics & Expand Toggle */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800/80">
          <div>
            <div className="text-xs text-zinc-400">Confidence Index</div>
            <div className="text-base font-semibold font-mono text-zinc-200">
              {report.confidencePercentage}%
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800 hidden sm:block" />

          <div>
            <div className="text-xs text-zinc-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Time-to-First-Request</span>
            </div>
            <div className="text-base font-semibold font-mono text-zinc-200">
              {report.timeToFirstRequest}
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800 hidden sm:block" />

          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Evidence ({report.evidenceLedger.length})</span>
            {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary Narrative */}
      <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60 pt-3">
        {report.executiveSummary}
      </p>

      {/* Hard Blockers Callout */}
      {report.hardBlockers.length > 0 && (
        <div className="mt-3 rounded-lg bg-rose-950/40 border border-rose-500/40 p-3 text-xs">
          <div className="font-semibold text-rose-300 flex items-center gap-1.5 mb-1.5">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Hard Blockers ({report.hardBlockers.length})</span>
          </div>
          <ul className="space-y-1 list-disc list-inside text-rose-200/90 pl-1">
            {report.hardBlockers.map((blocker, idx) => (
              <li key={idx} className="leading-snug">{blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mandatory Conditions Callout */}
      {report.mandatoryConditions.length > 0 && (
        <div className="mt-3 rounded-lg bg-amber-950/40 border border-amber-500/40 p-3 text-xs">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Mandatory Prerequisites Prior to Go-Live ({report.mandatoryConditions.length})</span>
          </div>
          <ul className="space-y-1 list-disc list-inside text-amber-200/90 pl-1">
            {report.mandatoryConditions.map((cond, idx) => (
              <li key={idx} className="leading-snug">{cond}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Evidence Ledger Drawer */}
      {showEvidence && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Comprehensive Evidence Ledger
            </h4>
            <span className="text-xs text-zinc-400">
              Generated: {new Date(report.generatedTimestamp).toLocaleDateString()}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Check Item</th>
                  <th className="py-2.5 px-3">Audited Technical Evidence</th>
                  <th className="py-2.5 px-3">Actionable Remediation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60">
                {report.evidenceLedger.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {item.verdict === 'PASS' && (
                        <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                        </span>
                      )}
                      {item.verdict === 'WARN' && (
                        <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> WARN
                        </span>
                      )}
                      {item.verdict === 'FAIL' && (
                        <span className="text-rose-400 font-mono font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> FAIL
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 font-medium whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-200 font-medium">
                      {item.check}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px] max-w-xs">
                      {item.evidence}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300 text-[11px]">
                      {item.remediationIfFail || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
