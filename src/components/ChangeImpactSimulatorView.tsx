import React, { useState } from 'react';
import {
  requirementChangePresets,
  simulateRequirementChange,
} from '../engine/changeImpactSimulator';
import {
  ImpactNodeId,
  RequirementChangePreset,
} from '../types/integration';
import {
  GitCommit,
  ArrowRight,
  Clock,
  DollarSign,
  Shield,
  FileCode,
  Zap,
  Info,
  Server,
  Layers,
  Database,
  Activity,
  User,
  Key,
} from 'lucide-react';

export const ChangeImpactSimulatorView: React.FC = () => {
  const [selectedChangeId, setSelectedChangeId] = useState<string>(
    requirementChangePresets[0].id
  );
  const [selectedNodeId, setSelectedNodeId] = useState<ImpactNodeId>('identity');

  const currentChange: RequirementChangePreset = simulateRequirementChange(selectedChangeId);
  const activeNodeImpact = currentChange.nodeImpacts[selectedNodeId];

  // Visual Graph nodes in fixed pipeline sequence
  const graphSequence: { id: ImpactNodeId; label: string; icon: React.ReactNode }[] = [
    { id: 'customer', label: 'Customer', icon: <User className="w-4 h-4" /> },
    { id: 'identity', label: 'Identity', icon: <Key className="w-4 h-4" /> },
    { id: 'api', label: 'API', icon: <Server className="w-4 h-4" /> },
    { id: 'data_transformation', label: 'Data Transformation', icon: <Layers className="w-4 h-4" /> },
    { id: 'internal_service', label: 'Internal Service', icon: <Cpu className="w-4 h-4" /> },
    { id: 'database', label: 'Database', icon: <Database className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> },
  ];

  const getNodeStyle = (status: 'affected' | 'reconfigured' | 'high_risk' | 'unchanged') => {
    switch (status) {
      case 'high_risk':
        return {
          border: 'border-rose-500/80 bg-rose-950/40 text-rose-300',
          indicator: 'bg-rose-500',
          label: 'HIGH RISK',
          badge: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        };
      case 'reconfigured':
        return {
          border: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300',
          indicator: 'bg-cyan-500',
          label: 'RECONFIGURED',
          badge: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40',
        };
      case 'affected':
        return {
          border: 'border-amber-500/80 bg-amber-950/40 text-amber-300',
          indicator: 'bg-amber-500',
          label: 'AFFECTED',
          badge: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
        };
      case 'unchanged':
        return {
          border: 'border-zinc-800 bg-zinc-950/40 text-zinc-500',
          indicator: 'bg-zinc-700',
          label: 'UNCHANGED',
          badge: 'text-zinc-500 bg-zinc-900 border-zinc-800',
        };
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-zinc-800 text-amber-400">
              <GitCommit className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-zinc-100 text-base">
              Requirement Change Impact Simulator
            </h3>
            <span className="text-zinc-500 font-mono text-xs">Ripple Effect Graph</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Simulate ad-hoc customer requirement shifts and trace architectural, security, latency, and cost repercussions.
          </p>
        </div>

        {/* Change Scenario Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
            Scenario:
          </span>
          <select
            value={selectedChangeId}
            onChange={(e) => {
              setSelectedChangeId(e.target.value);
            }}
            className="bg-zinc-950 border border-zinc-700 hover:border-zinc-600 text-zinc-200 text-xs rounded-md px-3 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors max-w-xs sm:max-w-md"
          >
            {requirementChangePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Impact Overview Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-500">Timeline Delta</div>
            <div className="text-base font-bold font-mono text-amber-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>+{currentChange.overallDelayDays} business days</span>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Sprint Impact</span>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-500">Monthly Cost Delta</div>
            <div className="text-base font-bold font-mono text-cyan-400 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>+${currentChange.overallCostDeltaUsd} / mo</span>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Infra Budget</span>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-500">Security Posture</div>
            <div className="text-xs font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]">Strengthened Perimeter</span>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Zero Trust</span>
        </div>
      </div>

      {/* Visual Dependency Ripple Graph (7 Nodes) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-400 font-medium">
            System Dependency Chain (Click node to inspect changes):
          </span>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> High Risk
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-500" /> Reconfigured
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Affected
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-zinc-700" /> Unchanged
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[760px] gap-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            {graphSequence.map((node, idx) => {
              const state = currentChange.nodeImpacts[node.id];
              const style = getNodeStyle(state.status);
              const isSelected = selectedNodeId === node.id;

              return (
                <React.Fragment key={node.id}>
                  <button
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`flex-1 p-2.5 rounded-lg border text-left transition-all relative ${style.border} ${
                      isSelected
                        ? 'ring-2 ring-emerald-500/80 shadow-md scale-[1.02]'
                        : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="p-1 rounded bg-zinc-900/80 text-zinc-300">
                        {node.icon}
                      </span>
                      <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-zinc-200 truncate">
                      {node.label}
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                      {state.changeTitle}
                    </div>
                  </button>

                  {idx < graphSequence.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Detailed Inspector */}
      {activeNodeImpact && (
        <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-zinc-200 font-semibold text-sm">
                Node Inspector: <span className="text-emerald-400">{activeNodeImpact.label}</span>
              </span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                  getNodeStyle(activeNodeImpact.status).badge
                }`}
              >
                {activeNodeImpact.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
              <span>
                Latency: <strong className="text-zinc-200">{activeNodeImpact.latencyDeltaMs > 0 ? `+${activeNodeImpact.latencyDeltaMs}ms` : `${activeNodeImpact.latencyDeltaMs}ms`}</strong>
              </span>
              <span>
                Cost: <strong className="text-zinc-200">+${activeNodeImpact.costDeltaMonthlyUsd}/mo</strong>
              </span>
              <span>
                Delay: <strong className="text-zinc-200">+{activeNodeImpact.timelineDelayDays} days</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-400 font-medium mb-1">
                Architectural Change Summary:
              </div>
              <div className="font-semibold text-zinc-200 mb-1.5">
                {activeNodeImpact.changeTitle}
              </div>
              <p className="text-zinc-300 leading-relaxed text-xs">
                {activeNodeImpact.detail}
              </p>
            </div>

            <div>
              <div className="text-zinc-400 font-medium mb-1 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Impacted Modules & Code Changes ({activeNodeImpact.codeChanges.length}):</span>
              </div>
              {activeNodeImpact.codeChanges.length > 0 ? (
                <div className="space-y-1 font-mono text-[11px]">
                  {activeNodeImpact.codeChanges.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300 flex items-center gap-2"
                    >
                      <span className="text-zinc-600">MOD:</span>
                      <span className="truncate">{file}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800/60 text-zinc-500 font-mono text-[11px]">
                  No direct code changes required for this node under current change specification.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Cpu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  );
}
