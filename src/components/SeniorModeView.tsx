import React, { useState } from 'react';
import { SeniorModeData, CustomerProfile } from '../types/integration';
import {
  Cpu,
  Layers,
  DollarSign,
  Activity,
  Shield,
  TrendingUp,
  LifeBuoy,
  GitBranch,
  AlertOctagon,
  FileCode,
  CheckCircle,
} from 'lucide-react';

interface SeniorModeViewProps {
  seniorData: SeniorModeData;
  profile: CustomerProfile;
}

export const SeniorModeView: React.FC<SeniorModeViewProps> = ({ seniorData, profile }) => {
  const [seniorTab, setSeniorTab] = useState<
    'tradeoffs' | 'failure_domains' | 'cost' | 'observability' | 'dr' | 'threat_model' | 'scaling' | 'support'
  >('tradeoffs');

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-zinc-800 text-indigo-400">
              <Cpu className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-zinc-100 text-base">
              Senior Solutions & Principal Architecture Mode
            </h3>
            <span className="text-zinc-500 font-mono text-xs">Production Grade System Engineering</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Deep-dive technical evaluations for blast radiuses, STRIDE threat vectors, multi-cloud cost forecasting, and operational handoff.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setSeniorTab('tradeoffs')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              seniorTab === 'tradeoffs' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tradeoffs
          </button>
          <button
            onClick={() => setSeniorTab('failure_domains')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              seniorTab === 'failure_domains' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Failure Domains
          </button>
          <button
            onClick={() => setSeniorTab('cost')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              seniorTab === 'cost' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cost Forecast
          </button>
          <button
            onClick={() => setSeniorTab('observability')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              seniorTab === 'observability' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Observability
          </button>
          <button
            onClick={() => setSeniorTab('dr')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              seniorTab === 'dr' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DR Plan
          </button>
          <button
            onClick={() => setSeniorTab('threat_model')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              seniorTab === 'threat_model' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Threat Model (STRIDE)
          </button>
          <button
            onClick={() => setSeniorTab('scaling')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              seniorTab === 'scaling' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Scaling
          </button>
          <button
            onClick={() => setSeniorTab('support')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              seniorTab === 'support' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Support Handoff
          </button>
        </div>
      </div>

      {/* 1. Architecture Tradeoffs */}
      {seniorTab === 'tradeoffs' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Formal Architecture Decision Record (ADR) trade-off evaluations comparing latency, consistency, operational overhead, and cost.
          </div>

          <div className="space-y-3">
            {seniorData.tradeoffs.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-xs">
                <div className="font-semibold text-zinc-100 text-sm mb-2.5 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span>Decision: {item.decision}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
                    <div className="font-medium text-emerald-400 mb-1.5">
                      Option A: {item.optionA.name}
                    </div>
                    <div className="space-y-1 text-zinc-400 text-[11px]">
                      <div><strong className="text-zinc-300">Pros:</strong> {item.optionA.pros.join(' · ')}</div>
                      <div><strong className="text-zinc-500">Cons:</strong> {item.optionA.cons.join(' · ')}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
                    <div className="font-medium text-cyan-400 mb-1.5">
                      Option B: {item.optionB.name}
                    </div>
                    <div className="space-y-1 text-zinc-400 text-[11px]">
                      <div><strong className="text-zinc-300">Pros:</strong> {item.optionB.pros.join(' · ')}</div>
                      <div><strong className="text-zinc-500">Cons:</strong> {item.optionB.cons.join(' · ')}</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-indigo-950/40 border border-indigo-500/40 font-mono text-[11px] text-indigo-200">
                  <strong className="text-indigo-400">Principal Recommendation: </strong>
                  {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Failure Domains & Blast Radius */}
      {seniorTab === 'failure_domains' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Cascading failure analysis and blast radius containment protocols across external dependencies.
          </div>

          <div className="space-y-2.5">
            {seniorData.failureDomains.map((fd, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-zinc-100 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-amber-400" />
                    <span>{fd.domain}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                      fd.blastRadius === 'Total Outage'
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold'
                        : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                    }`}
                  >
                    Blast Radius: {fd.blastRadius}
                  </span>
                </div>

                <p className="text-zinc-300 mb-2">
                  <strong className="text-zinc-500">Scenario:</strong> {fd.failureScenario}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    <strong className="text-emerald-400">Containment Strategy:</strong> {fd.containmentStrategy}
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
                    <strong className="text-amber-400">Circuit Breaker:</strong> {fd.circuitBreakerThreshold}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Deployment Cost Estimate */}
      {seniorTab === 'cost' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Monthly cloud infrastructure run-rate estimation modeled for {profile.deployment.target.toUpperCase()}.
            </span>
            <div className="text-xs font-mono">
              <span className="text-zinc-500">Projected Run Rate: </span>
              <span className="text-emerald-400 font-bold text-base">
                ${seniorData.deploymentCost.monthlyEstimateUsd} / mo
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Infrastructure Component</th>
                  <th className="py-2.5 px-3">Est. Monthly Cost</th>
                  <th className="py-2.5 px-3">Cost Sizing Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60">
                {seniorData.deploymentCost.breakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30">
                    <td className="py-2.5 px-3 font-medium text-zinc-200">
                      {row.item}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold whitespace-nowrap">
                      ${row.costUsd} / mo
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 text-[11px]">
                      {row.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Observability Plan */}
      {seniorTab === 'observability' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Four Golden Signals instrumentation with OpenTelemetry span names and Prometheus query thresholds.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {seniorData.observabilityPlan.goldenSignals.map((sig, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-zinc-200">{sig.signalType}</span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.2 rounded border ${
                      sig.alertPriority.includes('P1')
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {sig.alertPriority}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-zinc-400 mb-2 truncate" title={sig.metricName}>
                  {sig.metricName}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 bg-zinc-900/80 p-1.5 rounded border border-zinc-800">
                  Target: {sig.targetThreshold}
                </div>
              </div>
            ))}
          </div>

          {/* Structured Logging Schema */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono">
            <div className="text-zinc-400 mb-1.5 flex items-center gap-1.5 font-sans font-medium">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Standardized Structured JSON Logging Envelope (OpenTelemetry Aligned)</span>
            </div>
            <pre className="text-[11px] text-indigo-300 overflow-x-auto p-2.5 rounded bg-zinc-900 border border-zinc-800/80">
              {seniorData.observabilityPlan.loggingSchema}
            </pre>
          </div>
        </div>
      )}

      {/* 5. Disaster Recovery (DR) Plan */}
      {seniorTab === 'dr' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Business continuity SLA requirements and failover procedure.
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span>Target RTO: <strong className="text-emerald-400">{seniorData.disasterRecovery.rtoHours}h</strong></span>
              <span>Target RPO: <strong className="text-emerald-400">{seniorData.disasterRecovery.rpoMinutes}m</strong></span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
            <div className="text-zinc-300 font-medium mb-1">
              Topology: <span className="text-emerald-400 font-mono">{seniorData.disasterRecovery.multiRegionTopology}</span>
            </div>
            <div className="space-y-1.5 mt-3">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Runbook Failover Execution Steps:</div>
              {seniorData.disasterRecovery.failoverProcedure.map((step, idx) => (
                <div key={idx} className="p-2 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Threat Model (STRIDE) */}
      {seniorTab === 'threat_model' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            STRIDE threat modeling covering trust boundaries across the customer network interface.
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">STRIDE Category</th>
                  <th className="py-2.5 px-3">Attack Vector</th>
                  <th className="py-2.5 px-3">Engineering Mitigation Control</th>
                  <th className="py-2.5 px-3">Residual Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60">
                {seniorData.threatModelStride.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30">
                    <td className="py-2.5 px-3 font-mono font-semibold text-zinc-200">
                      {item.threatCategory}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300 text-[11px]">
                      {item.attackVector}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono text-[11px]">
                      {item.mitigationControl}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                      {item.residualRisk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Scaling Plan */}
      {seniorTab === 'scaling' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Throughput autoscaling curves, connection limits, and capacity bottleneck mitigations.
          </div>

          <div className="space-y-2.5">
            {seniorData.scalingPlan.map((plan, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                <div className="font-semibold text-zinc-100 mb-1 flex items-center justify-between">
                  <span>{plan.bottleneckComponent}</span>
                  <span className="font-mono text-amber-400 text-[11px]">Limit: {plan.limitThreshold}</span>
                </div>
                <div className="text-zinc-400 mb-1.5 text-[11px]">
                  <strong className="text-zinc-300">Autoscaling Trigger:</strong> {plan.autoscalingTrigger}
                </div>
                <div className="text-emerald-400 font-mono text-[11px] bg-zinc-900 p-2 rounded border border-zinc-800">
                  <span className="text-zinc-500">Mitigation: </span>{plan.mitigationPath}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Support Handoff */}
      {seniorTab === 'support' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Operational handoff package for Tier 1-3 support teams, including triage runbooks and error codes.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
              <div className="font-semibold text-zinc-200 mb-2 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tier-1 Support Runbook</span>
              </div>
              <ul className="space-y-1.5 text-zinc-300">
                {seniorData.supportHandoff.tier1Runbook.map((line, idx) => (
                  <li key={idx} className="text-[11px] font-mono leading-relaxed">{line}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
              <div className="font-semibold text-zinc-200 mb-2">
                Escalation Hierarchy & SLA
              </div>
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] leading-relaxed">
                {seniorData.supportHandoff.escalationMatrix}
              </div>
            </div>
          </div>

          {/* Common Error Taxonomy Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-2 px-3">Error Code</th>
                  <th className="py-2 px-3">Semantic Meaning</th>
                  <th className="py-2 px-3">Customer Support Triage SOP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60">
                {seniorData.supportHandoff.commonErrorTaxonomy.map((err, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-400 whitespace-nowrap">
                      {err.code}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300 text-[11px]">
                      {err.meaning}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono text-[11px]">
                      {err.triageAction}
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
