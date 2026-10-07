import React from 'react';
import { CustomerProfile, RoleType } from '../types/integration';
import { ROLE_LABELS } from './Header';
import { UserCheck, Sparkles, AlertOctagon, Target, CheckSquare } from 'lucide-react';

interface RolePerspectiveBannerProps {
  role: RoleType;
  profile: CustomerProfile;
}

export const RolePerspectiveBanner: React.FC<RolePerspectiveBannerProps> = ({ role, profile }) => {
  const meta = ROLE_LABELS[role];

  const getRoleTactics = () => {
    switch (role) {
      case 'fde':
        return {
          priority: 'Customer Pilot Velocity & Unknown Mitigation',
          risk: `Tight rate limits (${profile.rateLimits.rpsLimit} RPS) & customer network onboarding timeline.`,
          action: 'Schedule discovery sync with Customer NetOps to unblock VPC Endpoint Service acceptance.',
          deliverable: 'Validated Customer Environment Profile & Sprint 0 Milestone Plan.',
        };
      case 'solutions_architect':
        return {
          priority: 'End-to-End Architectural Alignment & Trade-Offs',
          risk: profile.auth.mechanism === 'mtls'
            ? 'Private PKI certificate authority chain resolution across cloud boundary.'
            : 'Multi-region disaster recovery RTO consistency.',
          action: `Verify target ${profile.deployment.target.toUpperCase()} architecture topology matches enterprise security review.`,
          deliverable: 'Approved Architecture Decision Record (ADR) and Sequence Blueprint.',
        };
      case 'backend_engineer':
        return {
          priority: 'API Contract Fidelity, Idempotency & Retry Buffering',
          risk: !profile.apiSpec.hasIdempotencyKeys
            ? 'API lacks native idempotency headers: risk of duplicate records on network timeouts.'
            : 'Outbound rate limit throttling cascades.',
          action: 'Implement Redis distributed deduplication window and SQS FIFO consumer worker pool.',
          deliverable: 'Zod schema mappers and integration test suites.',
        };
      case 'software_engineer':
        return {
          priority: 'Client SDK Integration & Error Handling Robustness',
          risk: 'Non-standard error payload taxonomy (HTTP 429 without Retry-After).',
          action: 'Wrap HTTP client with exponential jitter backoff and custom exception parser.',
          deliverable: 'Strongly typed client wrapper with 100% mock contract coverage.',
        };
      case 'cloud_engineer':
        return {
          priority: 'Network Plumbing, PrivateLink & Subnet Topology',
          risk: profile.networking.type === 'cloud_privatelink'
            ? 'Cross-account VPC Endpoint Service configuration and private DNS zones.'
            : 'Egress firewall inspection dropping TLS connections.',
          action: `Deploy Terraform modules for ${profile.deployment.target.toUpperCase()} Network Load Balancer and VPC peering.`,
          deliverable: 'Operational PrivateLink network tunnel verified via ping/curl.',
        };
      case 'platform_engineer':
        return {
          priority: 'Compute Runtime Autoscaling & Ingress Rate Throttling',
          risk: `Traffic burst from baseline (${profile.traffic.averageRps} RPS) to peak (${profile.traffic.peakRps} RPS).`,
          action: `Configure token-bucket leaky drain rate limiter matching ${profile.rateLimits.rpsLimit} RPS quota.`,
          deliverable: 'Autoscaling Helm chart with KEDA metrics trigger.',
        };
      case 'devops_engineer':
        return {
          priority: 'Immutable CI/CD Pipeline & Automated Rollback Triggers',
          risk: !profile.database.schemaMigrationAllowed
            ? 'Customer Change Advisory Board (CAB) forbids automated schema DDL migrations.'
            : 'Canary deployment latency degradation.',
          action: 'Set up Canary deployment pipeline with automated Route53 / DNS rollback on >1% error rate.',
          deliverable: 'Terraform deployment sequence and automated rollback runbook.',
        };
      case 'data_engineer':
        return {
          priority: 'Schema Normalization, Type Coercion & PII Masking',
          risk: profile.sampleData.hasTimestampMismatch
            ? 'Non-standard timestamp format and field casing divergence.'
            : 'Unmasked PII / PHI records traversing data pipelines.',
          action: 'Implement streaming transformation pipeline with KMS field-level envelope encryption.',
          deliverable: 'High-throughput data mapping layer with 0ms PII leak guarantee.',
        };
      case 'cybersecurity_engineer':
        return {
          priority: 'Defensive Controls, Threat Modeling (STRIDE) & Compliance',
          risk: profile.webhook.enabled && !profile.webhook.hasHmacSignature
            ? 'CRITICAL DEFECT: Webhook endpoint accepts unsigned callbacks without HMAC.'
            : 'Excessive IAM permissions on integration service account.',
          action: 'Enforce HMAC-SHA256 signature verification in ingress gateway middleware.',
          deliverable: 'Signed Security Audit Attestation and STRIDE Threat Model.',
        };
      case 'business_analyst':
        return {
          priority: 'SLA Protection, Scope Containment & Target Go-Live Feasibility',
          risk: `Customer target go-live date (${profile.targetGoLiveDate}) has tight buffer against friction score.`,
          action: 'Align customer executive sponsor on conditional prerequisites and weekly RACI check-ins.',
          deliverable: 'Customer-Facing Readiness Memo and Executive Milestone Tracker.',
        };
    }
  };

  const tactics = getRoleTactics();

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-zinc-800 text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100">{meta.label} Perspective</span>
              <span className="text-zinc-500 font-mono text-[11px]">Active Lens</span>
            </div>
            <div className="text-zinc-400 text-[11px]">{meta.desc}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-2.5 rounded-md bg-zinc-950/70 border border-zinc-800/80">
          <div className="text-zinc-400 font-medium flex items-center gap-1 mb-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Core Focus</span>
          </div>
          <div className="text-zinc-200 font-medium leading-snug">{tactics.priority}</div>
        </div>

        <div className="p-2.5 rounded-md bg-zinc-950/70 border border-zinc-800/80">
          <div className="text-zinc-400 font-medium flex items-center gap-1 mb-1">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span>Chief Risk Driver</span>
          </div>
          <div className="text-zinc-300 leading-snug">{tactics.risk}</div>
        </div>

        <div className="p-2.5 rounded-md bg-zinc-950/70 border border-zinc-800/80">
          <div className="text-zinc-400 font-medium flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Immediate Tactical Action</span>
          </div>
          <div className="text-zinc-300 leading-snug">{tactics.action}</div>
        </div>

        <div className="p-2.5 rounded-md bg-zinc-950/70 border border-zinc-800/80">
          <div className="text-zinc-400 font-medium flex items-center gap-1 mb-1">
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Required Deliverable</span>
          </div>
          <div className="text-zinc-200 font-mono text-[11px] leading-snug">{tactics.deliverable}</div>
        </div>
      </div>
    </div>
  );
};
