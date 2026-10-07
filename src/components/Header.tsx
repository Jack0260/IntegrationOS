import React from 'react';
import { CustomerProfile, RoleType } from '../types/integration';
import {
  ShieldAlert,
  Server,
  Layers,
  FileText,
  Compass,
  Cpu,
  Sparkles,
  Edit3,
  Database,
} from 'lucide-react';

interface HeaderProps {
  profiles: CustomerProfile[];
  activeProfile: CustomerProfile;
  onSelectProfile: (profile: CustomerProfile) => void;
  selectedRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  discoveryMode: boolean;
  onToggleDiscoveryMode: () => void;
  onOpenEditProfile: () => void;
  onOpenClientReport: () => void;
  onOpenDatabase: () => void;
}

export const ROLE_LABELS: Record<RoleType, { label: string; desc: string }> = {
  fde: { label: 'FDE (Forward Deployed)', desc: 'Customer onboarding velocity, discovery unknowns, and field delivery' },
  solutions_architect: { label: 'Solutions Architect', desc: 'End-to-end topology, cloud patterns, and trade-off matrices' },
  backend_engineer: { label: 'Backend Engineer', desc: 'API contracts, payload mappings, deduplication, and retry queues' },
  software_engineer: { label: 'Software Engineer', desc: 'Client SDK integration, typing, error handling, and unit test suites' },
  cloud_engineer: { label: 'Cloud Engineer', desc: 'AWS/Azure/GCP networking, PrivateLink endpoints, and IAM policies' },
  platform_engineer: { label: 'Platform Engineer', desc: 'Compute runtimes, container orchestration, and rate throttling' },
  devops_engineer: { label: 'DevOps Engineer', desc: 'CI/CD deployment sequences, Terraform IaC, and rollback gates' },
  business_analyst: { label: 'Business Analyst', desc: 'Scope alignment, go-live delivery timelines, and SLA agreements' },
  data_engineer: { label: 'Data Engineer', desc: 'Schema transformations, type coercion, CDC pipelines, and PII masking' },
  cybersecurity_engineer: { label: 'Cybersecurity Engineer', desc: 'Defensive audits, mTLS PKI, threat modeling, and compliance controls' },
};

export const Header: React.FC<HeaderProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  selectedRole,
  onSelectRole,
  seniorMode,
  onToggleSeniorMode,
  discoveryMode,
  onToggleDiscoveryMode,
  onOpenEditProfile,
  onOpenClientReport,
  onOpenDatabase,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Branding & Environment Profile Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 font-mono font-bold text-base shadow-inner">
              IO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100 tracking-tight text-base">
                  IntegrationOS
                </span>
                <span className="text-zinc-500 font-mono text-xs">v3.2</span>
              </div>
              <div className="text-zinc-400 text-xs flex items-center gap-1.5">
                <span>Customer Environment Intelligence</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="font-mono text-emerald-400/90">{activeProfile.deployment.target.toUpperCase()} Target</span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          {/* Customer Profile Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Customer:</span>
            <select
              aria-label="Customer Profile Selection"
              value={activeProfile.id}
              onChange={(e) => {
                const found = profiles.find((p) => p.id === e.target.value);
                if (found) onSelectProfile(found);
              }}
              className="bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-200 text-xs rounded-md px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.industry.split('&')[0].trim()})
                </option>
              ))}
            </select>

            <button
              onClick={onOpenEditProfile}
              title="Edit Profile Parameters"
              className="px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Spec</span>
            </button>
          </div>
        </div>

        {/* Right: Role Lens & Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Role Lens Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium hidden md:inline">Lens:</span>
            <select
              aria-label="Role Perspective Lens"
              value={selectedRole}
              onChange={(e) => onSelectRole(e.target.value as RoleType)}
              className="bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-200 text-xs rounded-md px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          {/* FDE Discovery Mode Toggle */}
          <button
            onClick={onToggleDiscoveryMode}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all flex items-center gap-1.5 ${
              discoveryMode
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Discovery Mode</span>
          </button>

          {/* Senior Mode Toggle */}
          <button
            onClick={onToggleSeniorMode}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all flex items-center gap-1.5 ${
              seniorMode
                ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Senior Mode</span>
          </button>

          {/* Client Report Export */}
          <button
            onClick={onOpenClientReport}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-600/50 text-emerald-300 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Client Memo</span>
          </button>

          {/* Database & Storage */}
          <button
            onClick={onOpenDatabase}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Database</span>
          </button>
        </div>
      </div>
    </header>
  );
};
