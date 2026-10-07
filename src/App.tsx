import React, { useState, useMemo } from 'react';
import { CustomerProfile, RoleType, AssumptionItem } from './types/integration';
import { mockProfiles } from './data/mockProfiles';
import { calculateIntegrationFriction } from './engine/frictionCalculator';
import { generateImplementationBlueprint } from './engine/blueprintGenerator';
import { runDefensiveSecurityAudit } from './engine/securityDefensiveAuditor';
import { evaluateIntegrationReadiness } from './engine/readinessEvaluator';
import { generateSeniorModeData } from './engine/seniorModeData';

import { Header } from './components/Header';
import { ReadinessBanner } from './components/ReadinessBanner';
import { RolePerspectiveBanner } from './components/RolePerspectiveBanner';
import { FrictionScoreCard } from './components/FrictionScoreCard';
import { ImplementationBlueprintView } from './components/ImplementationBlueprintView';
import { ChangeImpactSimulatorView } from './components/ChangeImpactSimulatorView';
import { SecurityAuditorView } from './components/SecurityAuditorView';
import { CustomerDiscoveryView } from './components/CustomerDiscoveryView';
import { SeniorModeView } from './components/SeniorModeView';
import { ProfileEditorModal } from './components/ProfileEditorModal';
import { ClientFacingReportModal } from './components/ClientFacingReportModal';
import { DatabaseManagerModal } from './components/DatabaseManagerModal';
import {
  initDatabase,
  saveProfileToDb,
  saveEvaluationSnapshot,
} from './db/integrationDb';

import {
  Flame,
  Layers,
  GitCommit,
  ShieldAlert,
  Compass,
  Cpu,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [profiles, setProfiles] = useState<CustomerProfile[]>(mockProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(mockProfiles[0].id);
  const [selectedRole, setSelectedRole] = useState<RoleType>('solutions_architect');
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [discoveryMode, setDiscoveryMode] = useState<boolean>(false);

  // Active section tab for main view
  const [activeMainTab, setActiveMainTab] = useState<
    'friction' | 'blueprint' | 'change_impact' | 'security' | 'discovery' | 'senior'
  >('friction');

  // Modals
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showClientReportModal, setShowClientReportModal] = useState<boolean>(false);
  const [showDbModal, setShowDbModal] = useState<boolean>(false);

  // Initialize persistent database on mount
  React.useEffect(() => {
    initDatabase().then((dbProfiles) => {
      if (dbProfiles && dbProfiles.length > 0) {
        setProfiles(dbProfiles);
        // Ensure active profile exists
        if (!dbProfiles.some((p) => p.id === activeProfileId)) {
          setActiveProfileId(dbProfiles[0].id);
        }
      }
    });
  }, []);

  // Active profile object
  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // Calculated intelligence artifacts
  const frictionAnalysis = useMemo(() => {
    return calculateIntegrationFriction(activeProfile);
  }, [activeProfile]);

  const implementationBlueprint = useMemo(() => {
    return generateImplementationBlueprint(activeProfile);
  }, [activeProfile]);

  const defensiveSecurityChecks = useMemo(() => {
    return runDefensiveSecurityAudit(activeProfile);
  }, [activeProfile]);

  const readinessReport = useMemo(() => {
    return evaluateIntegrationReadiness(activeProfile);
  }, [activeProfile]);

  const seniorData = useMemo(() => {
    return generateSeniorModeData(activeProfile);
  }, [activeProfile]);

  // Persist evaluation snapshot audit log in database
  React.useEffect(() => {
    if (activeProfile && readinessReport && frictionAnalysis) {
      saveEvaluationSnapshot(activeProfile, readinessReport, frictionAnalysis);
    }
  }, [activeProfile.id, readinessReport.status, frictionAnalysis.overallScore]);

  // Profile update handler
  const handleUpdateProfile = (updated: CustomerProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    saveProfileToDb(updated);
  };

  const handleProfilesFromDbRestore = (restored: CustomerProfile[]) => {
    setProfiles(restored);
    if (restored.length > 0 && !restored.some((p) => p.id === activeProfileId)) {
      setActiveProfileId(restored[0].id);
    }
  };

  // Discovery mode handlers
  const handleUpdateNotes = (notes: string) => {
    handleUpdateProfile({
      ...activeProfile,
      discoveryNotes: notes,
    });
  };

  const handleAddAssumption = (assumption: AssumptionItem) => {
    handleUpdateProfile({
      ...activeProfile,
      assumptions: [assumption, ...activeProfile.assumptions],
    });
  };

  const handleToggleValidateAssumption = (id: string) => {
    handleUpdateProfile({
      ...activeProfile,
      assumptions: activeProfile.assumptions.map((a) =>
        a.id === id ? { ...a, validated: !a.validated } : a
      ),
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Application Header */}
      <Header
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={(p) => setActiveProfileId(p.id)}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
        seniorMode={seniorMode}
        onToggleSeniorMode={() => {
          const next = !seniorMode;
          setSeniorMode(next);
          if (next) setActiveMainTab('senior');
        }}
        discoveryMode={discoveryMode}
        onToggleDiscoveryMode={() => {
          const next = !discoveryMode;
          setDiscoveryMode(next);
          if (next) setActiveMainTab('discovery');
        }}
        onOpenEditProfile={() => setShowEditModal(true)}
        onOpenClientReport={() => setShowClientReportModal(true)}
        onOpenDatabase={() => setShowDbModal(true)}
      />

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-5 sm:px-6 space-y-5">
        {/* Signature 5-Minute Integration Readiness Banner */}
        <ReadinessBanner
          report={readinessReport}
          customerName={activeProfile.name}
        />

        {/* Role Perspective Lens Banner */}
        <RolePerspectiveBanner
          role={selectedRole}
          profile={activeProfile}
        />

        {/* Primary Functional Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveMainTab('friction')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeMainTab === 'friction'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Friction Score ({frictionAnalysis.overallScore})</span>
            </button>

            <button
              onClick={() => setActiveMainTab('blueprint')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeMainTab === 'blueprint'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Implementation Blueprint</span>
            </button>

            <button
              onClick={() => setActiveMainTab('change_impact')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeMainTab === 'change_impact'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5 text-amber-400" />
              <span>Requirement Change Impact</span>
            </button>

            <button
              onClick={() => setActiveMainTab('security')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeMainTab === 'security'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Security Defensive Checks</span>
            </button>

            <button
              onClick={() => setActiveMainTab('discovery')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeMainTab === 'discovery'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>FDE Discovery Mode</span>
            </button>

            <button
              onClick={() => setActiveMainTab('senior')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeMainTab === 'senior'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Senior Mode</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>Target Provider:</span>
            <span className="text-zinc-300 font-bold uppercase">{activeProfile.deployment.target}</span>
          </div>
        </div>

        {/* Tab Views */}
        {activeMainTab === 'friction' && (
          <div className="space-y-5">
            <FrictionScoreCard analysis={frictionAnalysis} />
            <ImplementationBlueprintView
              blueprint={implementationBlueprint}
              profile={activeProfile}
            />
          </div>
        )}

        {activeMainTab === 'blueprint' && (
          <ImplementationBlueprintView
            blueprint={implementationBlueprint}
            profile={activeProfile}
          />
        )}

        {activeMainTab === 'change_impact' && (
          <ChangeImpactSimulatorView />
        )}

        {activeMainTab === 'security' && (
          <SecurityAuditorView checks={defensiveSecurityChecks} />
        )}

        {activeMainTab === 'discovery' && (
          <CustomerDiscoveryView
            profile={activeProfile}
            onUpdateNotes={handleUpdateNotes}
            onAddAssumption={handleAddAssumption}
            onToggleValidateAssumption={handleToggleValidateAssumption}
          />
        )}

        {activeMainTab === 'senior' && (
          <SeniorModeView
            seniorData={seniorData}
            profile={activeProfile}
          />
        )}
      </main>

      {/* Profile Editor Modal */}
      {showEditModal && (
        <ProfileEditorModal
          profile={activeProfile}
          onSave={handleUpdateProfile}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Client-Facing Readiness Memo Modal */}
      {showClientReportModal && (
        <ClientFacingReportModal
          profile={activeProfile}
          report={readinessReport}
          analysis={frictionAnalysis}
          onClose={() => setShowClientReportModal(false)}
        />
      )}

      {/* Persistent Database Manager Modal */}
      {showDbModal && (
        <DatabaseManagerModal
          profiles={profiles}
          onProfilesUpdated={handleProfilesFromDbRestore}
          onClose={() => setShowDbModal(false)}
        />
      )}
    </div>
  );
}
