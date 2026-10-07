import React, { useState } from 'react';
import { CustomerProfile, AssumptionItem } from '../types/integration';
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  HelpCircle,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface CustomerDiscoveryViewProps {
  profile: CustomerProfile;
  onUpdateNotes: (notes: string) => void;
  onAddAssumption: (assumption: AssumptionItem) => void;
  onToggleValidateAssumption: (id: string) => void;
}

export const CustomerDiscoveryView: React.FC<CustomerDiscoveryViewProps> = ({
  profile,
  onUpdateNotes,
  onAddAssumption,
  onToggleValidateAssumption,
}) => {
  const [notes, setNotes] = useState(profile.discoveryNotes);
  const [savedNotesMessage, setSavedNotesMessage] = useState(false);

  // New assumption state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStatement, setNewStatement] = useState('');
  const [newConfidence, setNewConfidence] = useState<'High' | 'Medium' | 'Speculative'>('Medium');
  const [newOwner, setNewOwner] = useState('');
  const [newRisk, setNewRisk] = useState('');

  // 12 Essential Discovery Questions Questionnaire
  const discoveryQuestions = [
    {
      q: '1. What is the authoritative Identity Provider (IdP) and token issuance standard (OIDC, SAML, mTLS)?',
      status: profile.auth.mechanism === 'mtls' ? 'Answered' : 'Answered',
      ans: `Auth mechanism: ${profile.auth.mechanism}. Token TTL: ${profile.auth.tokenLifetimeMinutes} minutes.`,
    },
    {
      q: '2. Are ingress and egress network paths restricted to AWS PrivateLink, Azure Private Endpoint, or static IP allowlists?',
      status: profile.networking.type !== 'public_internet' ? 'Answered' : 'Pending',
      ans: `Network type: ${profile.networking.type}. Strict egress firewall: ${profile.networking.strictEgressFirewall ? 'YES' : 'NO'}.`,
    },
    {
      q: '3. What are the sustained and peak requests-per-second (RPS) thresholds, and what is the concurrency limit?',
      status: 'Answered',
      ans: `Sustained limit: ${profile.rateLimits.rpsLimit} RPS. Burst limit: ${profile.rateLimits.burstLimit} RPS.`,
    },
    {
      q: '4. Does the customer API provide native idempotency keys (e.g. X-Idempotency-Key) on state-mutating POST/PUT calls?',
      status: profile.apiSpec.hasIdempotencyKeys ? 'Answered' : 'Blocker',
      ans: profile.apiSpec.hasIdempotencyKeys ? 'Yes, UUID header enforced.' : 'NO IDEMPOTENCY: Risk of duplicate transactions on network timeouts!',
    },
    {
      q: '5. Are webhook event notifications signed using HMAC-SHA256, and what is the retry backoff policy?',
      status: profile.webhook.hasHmacSignature ? 'Answered' : 'Blocker',
      ans: profile.webhook.hasHmacSignature ? 'HMAC-SHA256 signed with key rotation.' : 'NO HMAC SIGNATURE: Webhook receiver is vulnerable to spoofing!',
    },
    {
      q: '6. Does the payload contain Personal Identifiable Information (PII) or Protected Health Information (PHI)?',
      status: profile.sampleData.hasPiiData ? 'Answered' : 'Answered',
      ans: profile.sampleData.hasPiiData ? 'Yes: Sensitive identifiers present in payloads requiring field masking.' : 'No PII detected.',
    },
    {
      q: '7. Are schema migrations (DDL changes) permitted during automated deployment pipelines, or locked by CAB?',
      status: profile.database.schemaMigrationAllowed ? 'Answered' : 'Pending',
      ans: profile.database.schemaMigrationAllowed ? 'Permitted via automated Flyway/Prisma migrations.' : 'LOCKED: Requires Change Advisory Board 3-week lead time.',
    },
    {
      q: '8. What is the disaster recovery RTO (Recovery Time Objective) and RPO (Recovery Point Objective)?',
      status: 'Answered',
      ans: `Target RTO: ${profile.availability.rtoHours} hour(s). Target RPO: ${profile.availability.rpoMinutes} minute(s). Multi-region: ${profile.availability.multiRegionActiveActive ? 'Yes' : 'No'}.`,
    },
    {
      q: '9. Does the customer mandate on-premise forward egress proxy with TLS SNI inspection?',
      status: profile.networking.type === 'forward_egress_proxy' ? 'Answered' : 'Pending',
      ans: profile.networking.type === 'forward_egress_proxy' ? 'Yes, customer proxy inspects SNI headers.' : 'Standard direct routing.',
    },
    {
      q: '10. What compliance boundaries govern this tenant (SOC 2, PCI-DSS, HIPAA, FedRAMP)?',
      status: 'Answered',
      ans: `${profile.compliance.soc2 ? 'SOC 2, ' : ''}${profile.compliance.pciDss ? 'PCI-DSS, ' : ''}${profile.compliance.hipaa ? 'HIPAA, ' : ''}Data residency: ${profile.compliance.dataResidencyCountry}.`,
    },
    {
      q: '11. What is the expected payload size distribution (kilobytes vs multipart megabytes)?',
      status: 'Answered',
      ans: `Average payload size: ${profile.traffic.avgPayloadKb} KB. Pattern: ${profile.traffic.trafficPattern}.`,
    },
    {
      q: '12. What are the scheduled maintenance windows and downstream batch freeze periods?',
      status: 'Pending',
      ans: 'Pending Customer SysAdmin confirmation during Sprint 0 kickoff call.',
    },
  ];

  const handleSaveNotes = () => {
    onUpdateNotes(notes);
    setSavedNotesMessage(true);
    setTimeout(() => setSavedNotesMessage(false), 2000);
  };

  const handleCreateAssumption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatement.trim()) return;

    onAddAssumption({
      id: `asm-${Date.now()}`,
      statement: newStatement.trim(),
      confidence: newConfidence,
      owner: newOwner.trim() || 'FDE Lead',
      validated: false,
      riskIfFalse: newRisk.trim() || 'Uncertain delivery delay.',
    });

    setNewStatement('');
    setNewOwner('');
    setNewRisk('');
    setShowAddForm(false);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-zinc-800 text-amber-400">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-zinc-100 text-base">
              FDE Customer Discovery Workspace
            </h3>
            <span className="text-zinc-500 font-mono text-xs">Pre-Production Discovery & Unknowns</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Capture field requirements, track speculative technical assumptions, and evaluate environment readiness.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-zinc-400">Target Go-Live:</span>
          <span className="text-emerald-400 font-bold bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
            {profile.targetGoLiveDate}
          </span>
        </div>
      </div>

      {/* Assumptions Tracking Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Assumption Tracking Matrix ({profile.assumptions.length})
            </h4>
            <p className="text-[11px] text-zinc-400">
              Assumptions made regarding customer environment. Unvalidated assumptions represent potential delivery risk.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Assumption</span>
          </button>
        </div>

        {/* Add Assumption Inline Form */}
        {showAddForm && (
          <form onSubmit={handleCreateAssumption} className="mb-4 p-3.5 rounded-lg bg-zinc-950 border border-zinc-700 space-y-3 text-xs">
            <div className="font-semibold text-zinc-200">Log New Technical Assumption</div>
            <div>
              <label className="block text-zinc-400 mb-1">Assumption Statement:</label>
              <input
                type="text"
                value={newStatement}
                onChange={(e) => setNewStatement(e.target.value)}
                placeholder="e.g. Customer firewall allows outbound port 443 with SNI preservation"
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Confidence Rating:</label>
                <select
                  value={newConfidence}
                  onChange={(e) => setNewConfidence(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Speculative">Speculative</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Owner / Stakeholder:</label>
                <input
                  type="text"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="e.g. Customer NetOps"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Consequence If False:</label>
                <input
                  type="text"
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value)}
                  placeholder="e.g. Connection timeouts at edge"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold"
              >
                Save Assumption
              </button>
            </div>
          </form>
        )}

        {/* Assumptions List */}
        <div className="space-y-2">
          {profile.assumptions.map((asm) => (
            <div
              key={asm.id}
              className={`rounded-lg border p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                asm.validated
                  ? 'bg-zinc-950/60 border-zinc-800/80'
                  : 'bg-zinc-950/90 border-amber-900/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                      asm.confidence === 'High'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : asm.confidence === 'Medium'
                        ? 'bg-yellow-950/60 border-yellow-500/50 text-yellow-300'
                        : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    {asm.confidence} Confidence
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Owner: {asm.owner}
                  </span>
                </div>
                <div className="text-zinc-200 font-medium">
                  {asm.statement}
                </div>
                <div className="text-zinc-400 text-[11px]">
                  <strong className="text-zinc-500">Risk if False:</strong> {asm.riskIfFalse}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => onToggleValidateAssumption(asm.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors flex items-center gap-1 ${
                    asm.validated
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{asm.validated ? 'Validated in Field' : 'Mark Validated'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discovery Notes & 12 Discovery Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
        {/* Left: 12 Key Discovery Questions */}
        <div>
          <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono mb-2">
            12 Essential Discovery Questions
          </h4>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {discoveryQuestions.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-zinc-200">{item.q}</span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.2 rounded border shrink-0 ${
                      item.status === 'Answered'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : item.status === 'Blocker'
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold'
                        : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-zinc-400 font-mono text-[11px] leading-relaxed">
                  {item.ans}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Customer Interview Notepad */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Field Interview Notes & Action Items
            </h4>
            {savedNotesMessage && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={14}
            placeholder="Record real-time discovery call notes, technical constraints, customer attendees, and action items..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg p-3 text-zinc-300 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-semibold transition-colors"
            >
              Update Discovery Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
