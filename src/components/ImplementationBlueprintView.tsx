import React, { useState } from 'react';
import { ImplementationBlueprint, CustomerProfile } from '../types/integration';
import {
  Layers,
  ArrowRight,
  Database,
  Lock,
  Network,
  Cpu,
  CheckSquare,
  RotateCcw,
  HelpCircle,
  Shield,
  FileCode,
  Terminal,
} from 'lucide-react';

interface BlueprintViewProps {
  blueprint: ImplementationBlueprint;
  profile: CustomerProfile;
}

export const ImplementationBlueprintView: React.FC<BlueprintViewProps> = ({ blueprint, profile }) => {
  const [activeTab, setActiveTab] = useState<
    'architecture' | 'data_mappings' | 'steps' | 'deployment' | 'testing' | 'rollback' | 'questions'
  >('architecture');

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [testedItems, setTestedItems] = useState<Record<string, boolean>>({});

  const toggleTest = (id: string) => {
    setTestedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 shadow-sm">
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-zinc-800 text-cyan-400">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-zinc-100 text-base">
              Implementation Blueprint
            </h3>
            <span className="text-zinc-500 font-mono text-xs">
              {profile.deployment.target.toUpperCase()} Cloud Architecture
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Engineered implementation specification covering target topology, data transformations, deployment pipelines, and failure runbooks.
          </p>
        </div>

        {/* Blueprint Segmented Tabs */}
        <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'architecture'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Target Architecture
          </button>
          <button
            onClick={() => setActiveTab('data_mappings')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'data_mappings'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Data Mappings ({blueprint.dataMappings.length})
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'steps'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Phased Steps
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'deployment'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Deployment IaC
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'testing'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Testing Checklist
          </button>
          <button
            onClick={() => setActiveTab('rollback')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'rollback'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Rollback Plan
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'questions'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Unresolved ({blueprint.unresolvedQuestions.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Target Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-300 font-medium">
              Topology: <span className="font-mono text-emerald-400">{blueprint.targetArchitecture.topologyTitle}</span>
            </div>
            <div className="text-xs text-zinc-500 font-mono">
              Click any component to inspect runtime details
            </div>
          </div>

          {/* Interactive Topology Graph Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {blueprint.targetArchitecture.nodes.map((node, idx) => {
              const isSelected = selectedNode === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  className={`text-left rounded-lg p-3 border transition-all ${
                    isSelected
                      ? 'bg-zinc-800 border-emerald-500 ring-1 ring-emerald-500/50'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                      Step {idx + 1} · {node.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        node.status === 'Ready'
                          ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                          : 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <div className="font-medium text-xs text-zinc-200 mb-1">
                    {node.label}
                  </div>

                  <div className="text-[11px] font-mono text-emerald-400/90 truncate mb-2">
                    {node.serviceName}
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Ingress-to-Persistence Edge Transport Protocol Table */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
            <div className="text-zinc-400 font-medium mb-2 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inter-Service Transport Links & Expected Latency Budgets</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {blueprint.targetArchitecture.edges.map((edge, idx) => (
                <div key={idx} className="p-2 rounded bg-zinc-900/80 border border-zinc-800/80 font-mono text-[11px] flex items-center justify-between">
                  <div className="text-zinc-300 truncate">
                    {edge.from.replace('arch-', '')} → {edge.to.replace('arch-', '')}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-zinc-500 text-[10px]">{edge.protocol}</span>
                    <span className="text-emerald-400 font-bold">{edge.latencyEst}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Data Mappings */}
      {activeTab === 'data_mappings' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Source-to-target field mapping matrix with type coercion rules, PII classification, and nullability enforcement.
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-2 px-3">Source Field</th>
                  <th className="py-2 px-3">Target Field</th>
                  <th className="py-2 px-3">Transformation / Function</th>
                  <th className="py-2 px-3">Null Safety & Validation</th>
                  <th className="py-2 px-3">PII Guard</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60">
                {blueprint.dataMappings.map((map) => (
                  <tr key={map.id} className="hover:bg-zinc-900/30">
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-zinc-200">{map.sourceField}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{map.sourceType}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-emerald-300">{map.targetField}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{map.targetType}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-300">
                      {map.transformation}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 text-[11px]">
                      {map.nullSafetyRule}
                    </td>
                    <td className="py-2.5 px-3">
                      {map.isPii ? (
                        <span className="font-mono text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> PII Masked
                        </span>
                      ) : (
                        <span className="text-zinc-600 font-mono text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                          map.status === 'Mapped'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        }`}
                      >
                        {map.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Phased Integration Steps */}
      {activeTab === 'steps' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            End-to-end delivery sequence organized by delivery phases, assigned engineering roles, and hard milestone deliverables.
          </div>

          <div className="space-y-2">
            {blueprint.integrationSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">
                      {step.stepNumber}
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">
                      {step.phaseName}
                    </span>
                    <span aria-hidden="true" className="text-zinc-700">·</span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {step.durationDays} business days
                    </span>
                  </div>
                  <div className="font-medium text-zinc-100 text-sm">
                    {step.title}
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    <strong className="text-zinc-300">Deliverable:</strong> {step.deliverable}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500 font-mono">Owner</div>
                    <div className="font-mono text-[11px] text-cyan-300">
                      {step.ownerRole.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                      step.status === 'Completed'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : step.status === 'In Progress'
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Deployment Sequence */}
      {activeTab === 'deployment' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Infrastructure-as-Code sequence with deterministic validation checks and automated rollback steps.
          </div>

          <div className="space-y-2.5">
            {blueprint.deploymentSequence.map((dep) => (
              <div
                key={dep.order}
                className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-200">
                      Order #{dep.order}
                    </span>
                    <span aria-hidden="true" className="text-zinc-700">·</span>
                    <span className="font-medium text-emerald-400">{dep.component}</span>
                  </div>
                  <span className="font-mono text-[11px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800">
                    {dep.iacTool}
                  </span>
                </div>

                <div className="text-zinc-300 mb-2">{dep.action}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-zinc-900/90 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] uppercase mb-0.5">Verification Probe</div>
                    <div className="text-zinc-300 truncate">{dep.validationCheck}</div>
                  </div>
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40">
                    <div className="text-rose-400 text-[10px] uppercase mb-0.5">Rollback Command</div>
                    <div className="text-rose-300 truncate">{dep.rollbackAction}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Testing Checklist */}
      {activeTab === 'testing' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Interactive pre-flight testing checklist. Required checks must pass before opening production traffic.
            </span>
            <span className="text-xs font-mono text-emerald-400">
              {Object.values(testedItems).filter(Boolean).length} / {blueprint.testingChecklist.length} verified
            </span>
          </div>

          <div className="space-y-2">
            {blueprint.testingChecklist.map((test) => {
              const isChecked = !!testedItems[test.id];
              return (
                <div
                  key={test.id}
                  className={`rounded-lg border p-3 text-xs transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-zinc-950/70 border-zinc-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleTest(test.id)}
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-zinc-200">
                        {test.testName}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {test.category}
                      </span>
                    </div>

                    <div className="text-zinc-400 text-[11px]">
                      <strong className="text-zinc-300">Method:</strong> {test.verificationMethod}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                      <span>Tooling: {test.tooling}</span>
                      <span aria-hidden="true">·</span>
                      <span className={test.requiredForGoLive ? 'text-amber-400' : 'text-zinc-500'}>
                        {test.requiredForGoLive ? 'Mandatory for Go-Live' : 'Optional Advisory'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 6: Rollback Plan */}
      {activeTab === 'rollback' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Emergency failover triggers, circuit breaker trips, and data protection strategies.
          </div>

          <div className="space-y-2.5">
            {blueprint.rollbackPlan.map((rb) => (
              <div
                key={rb.stepNumber}
                className="rounded-lg border border-rose-900/40 bg-zinc-950/80 p-3 text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Trigger: {rb.triggerCondition}</span>
                  </div>
                  <span className="font-mono text-[11px] text-rose-400">
                    Max RTO: {rb.maxRtoMinutes} min
                  </span>
                </div>

                <div className="text-zinc-200 mb-2">
                  <strong className="text-zinc-400">Execution Action:</strong> {rb.action}
                </div>

                <div className="text-[11px] text-emerald-400/90 font-mono bg-zinc-900/90 p-2 rounded border border-zinc-800">
                  <span className="text-zinc-500">Data Integrity Protection: </span>
                  {rb.dataIntegrityProtection}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Unresolved Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Customer unknowns and technical discovery questions tracked by urgency and assigned stakeholder.
          </div>

          <div className="space-y-2">
            {blueprint.unresolvedQuestions.map((q) => (
              <div
                key={q.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        q.urgency === 'Blocker'
                          ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold'
                          : q.urgency === 'High'
                          ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {q.urgency}
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">
                      Stakeholder: {q.stakeholder}
                    </span>
                  </div>
                  <div className="font-medium text-zinc-200">
                    {q.question}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500 font-mono">Assigned</div>
                    <div className="font-mono text-[11px] text-zinc-300">
                      {q.assignedRole.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {q.resolutionStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
