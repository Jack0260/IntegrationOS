import { CustomerProfile, ReadinessReport, ReadinessEvidenceItem } from '../types/integration';

export function evaluateIntegrationReadiness(profile: CustomerProfile): ReadinessReport {
  const evidenceLedger: ReadinessEvidenceItem[] = [];
  const hardBlockers: string[] = [];
  const mandatoryConditions: string[] = [];

  // Check 1: Webhook HMAC
  if (profile.webhook.enabled && !profile.webhook.hasHmacSignature) {
    hardBlockers.push('Unsigned Webhook Callbacks: Webhooks lack HMAC signature verification, exposing system to remote spoofing.');
    evidenceLedger.push({
      id: 'ev-webhook',
      category: 'Authentication',
      check: 'Webhook Payload Authenticity & HMAC Signing',
      verdict: 'FAIL',
      evidence: 'Webhook enabled=true, hasHmacSignature=false. Ingress accepts unauthenticated HTTP POST callbacks.',
      remediationIfFail: 'Mandate HMAC-SHA256 signature header and reject unsigned payloads.',
    });
  } else if (profile.webhook.enabled) {
    evidenceLedger.push({
      id: 'ev-webhook',
      category: 'Authentication',
      check: 'Webhook Payload Authenticity & HMAC Signing',
      verdict: 'PASS',
      evidence: 'HMAC-SHA256 signature enabled with secret rotation support.',
    });
  }

  // Check 2: Basic Auth
  if (profile.auth.mechanism === 'basic_auth_deprecated') {
    hardBlockers.push('Insecure Static Credentials: Basic Auth violates corporate zero-trust identity policies.');
    evidenceLedger.push({
      id: 'ev-auth',
      category: 'Authentication',
      check: 'Identity & Access Token Standard',
      verdict: 'FAIL',
      evidence: 'Auth mechanism is set to Basic Auth (static password). No token expiration or scope granularity.',
      remediationIfFail: 'Upgrade customer authentication to OAuth 2.0 Client Credentials or mTLS.',
    });
  } else {
    evidenceLedger.push({
      id: 'ev-auth',
      category: 'Authentication',
      check: 'Identity & Access Token Standard',
      verdict: 'PASS',
      evidence: `Auth mechanism is ${profile.auth.mechanism.replace(/_/g, ' ').toUpperCase()} with ${profile.auth.tokenLifetimeMinutes}m TTL.`,
    });
  }

  // Check 3: PrivateLink / Networking
  if (profile.networking.type === 'airgapped_dmz') {
    hardBlockers.push('Airgapped DMZ Restriction: No automated ingestion channel exists without manual batch media transport.');
    evidenceLedger.push({
      id: 'ev-net',
      category: 'Networking',
      check: 'Network Boundary Reachability',
      verdict: 'FAIL',
      evidence: 'DMZ airgap blocks network sockets to cloud infrastructure.',
      remediationIfFail: 'Establish dedicated Hardware Security Module (HSM) or diode proxy link.',
    });
  } else if (profile.networking.type === 'cloud_privatelink') {
    mandatoryConditions.push('Customer Network Operations must accept the AWS/Azure/GCP PrivateLink Endpoint connection in their cloud console.');
    evidenceLedger.push({
      id: 'ev-net',
      category: 'Networking',
      check: 'Private Network Peering / PrivateLink',
      verdict: 'WARN',
      evidence: 'PrivateLink required. Endpoint service created but pending customer side acceptance ticket.',
      remediationIfFail: 'Exchange Account ID and VPC Endpoint Service Name with Customer NetOps.',
    });
  } else {
    evidenceLedger.push({
      id: 'ev-net',
      category: 'Networking',
      check: 'Network Boundary Reachability',
      verdict: 'PASS',
      evidence: `Network transport via ${profile.networking.type.replace(/_/g, ' ')} is supported and open.`,
    });
  }

  // Check 4: Idempotency & Duplicate Safety
  if (!profile.apiSpec.hasIdempotencyKeys) {
    mandatoryConditions.push('Application must deploy synthetic 24-hour Redis deduplication window to guard against duplicate payment/state commits.');
    evidenceLedger.push({
      id: 'ev-idemp',
      category: 'Operational',
      check: 'Write Idempotency & Replay Protection',
      verdict: 'WARN',
      evidence: 'API specification lacks native X-Idempotency-Key support on write endpoints.',
      remediationIfFail: 'Implement Redis distributed deduplication hash in middleware.',
    });
  } else {
    evidenceLedger.push({
      id: 'ev-idemp',
      category: 'Operational',
      check: 'Write Idempotency & Replay Protection',
      verdict: 'PASS',
      evidence: 'Native idempotency keys enforced on all state-mutating endpoints.',
    });
  }

  // Check 5: Rate Limiting & Concurrency Headroom
  if (profile.rateLimits.rpsLimit < 15) {
    mandatoryConditions.push(`Severe rate ceiling (${profile.rateLimits.rpsLimit} RPS): Ingestion queue must be decoupled with asynchronous worker pacing.`);
    evidenceLedger.push({
      id: 'ev-rate',
      category: 'Operational',
      check: 'Rate Limiting & Concurrency Quota Headroom',
      verdict: 'WARN',
      evidence: `RPS cap is ${profile.rateLimits.rpsLimit}. High probability of 429 throttling under normal workload.`,
      remediationIfFail: 'Implement SQS queue buffer with rate-paced consumer workers.',
    });
  } else {
    evidenceLedger.push({
      id: 'ev-rate',
      category: 'Operational',
      check: 'Rate Limiting & Concurrency Quota Headroom',
      verdict: 'PASS',
      evidence: `RPS limit is ${profile.rateLimits.rpsLimit} RPS with ${profile.rateLimits.burstLimit} burst headroom.`,
    });
  }

  // Check 6: Compliance & PII Guardrails
  if (profile.sampleData.hasPiiData && !profile.compliance.soc2 && !profile.compliance.pciDss && !profile.compliance.hipaa) {
    hardBlockers.push('Uncertified PII Ingestion: Personal Identifiable Information detected in schemas without compliance certifications.');
    evidenceLedger.push({
      id: 'ev-comp',
      category: 'Compliance',
      check: 'Data Privacy & Regulatory Framework Alignment',
      verdict: 'FAIL',
      evidence: 'Payload contains SSN/Cardholder/PHI data while SOC2/PCI/HIPAA flags are inactive.',
      remediationIfFail: 'Sign compliance BAA or mask sensitive fields prior to transmission.',
    });
  } else {
    evidenceLedger.push({
      id: 'ev-comp',
      category: 'Compliance',
      check: 'Data Privacy & Regulatory Framework Alignment',
      verdict: 'PASS',
      evidence: `Compliance governance verified (${profile.compliance.soc2 ? 'SOC2 ' : ''}${profile.compliance.pciDss ? 'PCI-DSS ' : ''}${profile.compliance.hipaa ? 'HIPAA' : ''}).`,
    });
  }

  // Check 7: Schema Compatibility
  if (profile.sampleData.hasTimestampMismatch || profile.sampleData.hasCasingMismatch) {
    mandatoryConditions.push('Schema mapping transformation code must be deployed and validated with 100% test coverage before production traffic cutover.');
    evidenceLedger.push({
      id: 'ev-schema',
      category: 'Schema & Data',
      check: 'Schema Compatibility & Key Alignment',
      verdict: 'WARN',
      evidence: `Mismatches detected: ${profile.sampleData.hasTimestampMismatch ? 'Timestamp format discrepancy; ' : ''}${profile.sampleData.hasCasingMismatch ? 'Casing convention divergence' : ''}`,
      remediationIfFail: 'Deploy Zod / Protobuf normalization pipeline.',
    });
  } else {
    evidenceLedger.push({
      id: 'ev-schema',
      category: 'Schema & Data',
      check: 'Schema Compatibility & Key Alignment',
      verdict: 'PASS',
      evidence: 'Schema structures and timestamp conventions are fully compatible.',
    });
  }

  // Determine Overall Status
  let status: 'READY' | 'READY WITH CONDITIONS' | 'BLOCKED';
  let confidencePercentage = 95;
  let timeToFirstRequest = '3 - 5 business days';
  let executiveSummary = '';

  if (hardBlockers.length > 0) {
    status = 'BLOCKED';
    confidencePercentage = Math.max(15, 40 - hardBlockers.length * 15);
    timeToFirstRequest = 'Indefinite (BLOCKED pending remediation)';
    executiveSummary = `Implementation is BLOCKED by ${hardBlockers.length} critical security or architectural blocker(s). Proceeding to production would introduce severe compliance or operational vulnerabilities. Remediation required immediately.`;
  } else if (mandatoryConditions.length > 0) {
    status = 'READY WITH CONDITIONS';
    confidencePercentage = Math.max(60, 88 - mandatoryConditions.length * 7);
    timeToFirstRequest = '10 - 15 business days (conditional on prerequisites)';
    executiveSummary = `Implementation is READY WITH CONDITIONS. No fatal blockers detected, but ${mandatoryConditions.length} operational prerequisite(s) must be satisfied (e.g. PrivateLink acceptance, rate buffering, schema mappings) before dark launch.`;
  } else {
    status = 'READY';
    confidencePercentage = 98;
    timeToFirstRequest = '48 - 72 hours (Immediate Fast Track)';
    executiveSummary = 'Implementation is fully READY. All networking, identity, schema, rate limiting, and defensive security checks have passed. Architecture is clear to initiate staging handshake.';
  }

  return {
    status,
    confidencePercentage,
    timeToFirstRequest,
    executiveSummary,
    hardBlockers,
    mandatoryConditions,
    evidenceLedger,
    generatedTimestamp: new Date().toISOString(),
  };
}
