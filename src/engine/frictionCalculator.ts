import { CustomerProfile, FrictionAnalysis, FrictionCategoryScore } from '../types/integration';

export function calculateIntegrationFriction(profile: CustomerProfile): FrictionAnalysis {
  // 1. Schema Mismatch (Weight: 12%)
  let schemaPoints = 15;
  const schemaFactors: string[] = [];
  if (profile.sampleData.hasTimestampMismatch) {
    schemaPoints += 25;
    schemaFactors.push('Timestamp format discrepancy (epoch ms or non-ISO vs strict ISO-8601 target)');
  }
  if (profile.sampleData.hasCasingMismatch) {
    schemaPoints += 20;
    schemaFactors.push('Casing mismatch (snake_case/SCREAMING_SNAKE vs target camelCase conventions)');
  }
  if (profile.sampleData.format === 'XML' || profile.apiSpec.format === 'SOAP / XML') {
    schemaPoints += 30;
    schemaFactors.push('SOAP/XML envelope unwrapping and namespace resolution overhead');
  } else if (profile.sampleData.format === 'CSV') {
    schemaPoints += 25;
    schemaFactors.push('Flat CSV schema lacks native type enforcement (all fields ingested as raw strings)');
  }
  if (profile.sampleData.hasNestedArrays) {
    schemaPoints += 15;
    schemaFactors.push('Complex nested array iteration requiring normalization and relational unnesting');
  }
  schemaPoints = Math.min(100, Math.max(0, schemaPoints));
  const schemaCat: FrictionCategoryScore = {
    id: 'schemaMismatch',
    name: 'Schema Mismatch',
    score: schemaPoints,
    weight: 0.12,
    riskLevel: schemaPoints > 70 ? 'CRITICAL' : schemaPoints > 45 ? 'HIGH' : schemaPoints > 25 ? 'MEDIUM' : 'LOW',
    factors: schemaFactors.length > 0 ? schemaFactors : ['Consistent JSON schema with aligned naming conventions'],
    remediation: schemaPoints > 40
      ? 'Introduce an intermediate schema validation layer with declarative Zod / Protobuf schemas to coerce timestamps and normalize field keys before persistence.'
      : 'Maintain automated schema contract testing in pre-production pipeline.',
  };

  // 2. Authentication Complexity (Weight: 14%)
  let authPoints = 10;
  const authFactors: string[] = [];
  if (profile.auth.mechanism === 'mtls') {
    authPoints += 45;
    authFactors.push('mTLS requires mutual certificate distribution, revocation checks (OCSP/CRL), and PKI pipeline setup');
  } else if (profile.auth.mechanism === 'saml_oidc_sso') {
    authPoints += 35;
    authFactors.push('Federated SSO requires SAML assertion parsing, IdP token exchange, and session state handling');
  } else if (profile.auth.mechanism === 'aws_sigv4') {
    authPoints += 30;
    authFactors.push('AWS SigV4 requires canonical request construction and SHA256 header HMAC hashing');
  } else if (profile.auth.mechanism === 'basic_auth_deprecated') {
    authPoints += 55;
    authFactors.push('Basic Auth is legacy/insecure and violates modern zero-trust enterprise security standards');
  } else if (profile.auth.mechanism === 'oauth2_client_credentials') {
    authPoints += 15;
    authFactors.push('Standard OAuth2 client credentials flow with automatic token caching and expiration refresh');
  }
  if (profile.auth.tokenLifetimeMinutes < 30) {
    authPoints += 15;
    authFactors.push(`Short token TTL (${profile.auth.tokenLifetimeMinutes} min) requires high-frequency in-memory token refresh mutex`);
  }
  authPoints = Math.min(100, Math.max(0, authPoints));
  const authCat: FrictionCategoryScore = {
    id: 'authenticationComplexity',
    name: 'Authentication Complexity',
    score: authPoints,
    weight: 0.14,
    riskLevel: authPoints > 70 ? 'CRITICAL' : authPoints > 45 ? 'HIGH' : authPoints > 25 ? 'MEDIUM' : 'LOW',
    factors: authFactors.length > 0 ? authFactors : ['Standard token-based authentication with automated rotation'],
    remediation: profile.auth.mechanism === 'basic_auth_deprecated'
      ? 'Mandate migration to OAuth2 Client Credentials or signed JWT bearer tokens before opening production traffic.'
      : 'Deploy a centralized Auth Proxy (Envoy / API Gateway) to terminate mTLS/tokens at the network perimeter.',
  };

  // 3. API Complexity (Weight: 12%)
  let apiPoints = 10;
  const apiFactors: string[] = [];
  if (!profile.apiSpec.hasPagination) {
    apiPoints += 25;
    apiFactors.push('Missing API pagination: risk of memory bloat or request timeouts on large entity sets');
  }
  if (!profile.apiSpec.hasIdempotencyKeys) {
    apiPoints += 30;
    apiFactors.push('No idempotency keys supported on write endpoints: high risk of duplicate records on network retry');
  }
  if (profile.apiSpec.endpointsCount > 40) {
    apiPoints += 20;
    apiFactors.push(`Broad endpoint surface (${profile.apiSpec.endpointsCount} endpoints) requiring extensive contract testing`);
  }
  if (profile.apiSpec.format === 'SOAP / XML') {
    apiPoints += 30;
    apiFactors.push('SOAP WSDL endpoint lacks native REST tooling, requiring legacy XML serialization bindings');
  }
  apiPoints = Math.min(100, Math.max(0, apiPoints));
  const apiCat: FrictionCategoryScore = {
    id: 'apiComplexity',
    name: 'API Complexity',
    score: apiPoints,
    weight: 0.12,
    riskLevel: apiPoints > 70 ? 'CRITICAL' : apiPoints > 45 ? 'HIGH' : apiPoints > 25 ? 'MEDIUM' : 'LOW',
    factors: apiFactors.length > 0 ? apiFactors : ['Modern REST API with pagination and idempotency headers enabled'],
    remediation: !profile.apiSpec.hasIdempotencyKeys
      ? 'Implement synthetic idempotency keys in application middleware with Redis distributed deduplication window (e.g., 24hr TTL).'
      : 'Maintain automated Postman / Newman regression suite mapped to OpenAPI spec.',
  };

  // 4. Transformation Effort (Weight: 12%)
  let transPoints = 15;
  const transFactors: string[] = [];
  if (profile.sampleData.hasPiiData) {
    transPoints += 30;
    transFactors.push('PII/PHI data present: mandates field-level tokenization or deterministic hashing before transformation');
  }
  if (profile.sampleData.format === 'CSV') {
    transPoints += 25;
    transFactors.push('Batch tabular transformation requiring streaming parser, column indexing, and error dead-lettering');
  }
  if (profile.sampleData.hasTimestampMismatch) {
    transPoints += 15;
    transFactors.push('Datetime conversion routines required across disparate timezone and epoch conventions');
  }
  if (profile.sampleData.hasCasingMismatch) {
    transPoints += 15;
    transFactors.push('Key mapping dictionaries required for every upstream entity');
  }
  transPoints = Math.min(100, Math.max(0, transPoints));
  const transCat: FrictionCategoryScore = {
    id: 'transformationEffort',
    name: 'Transformation Effort',
    score: transPoints,
    weight: 0.12,
    riskLevel: transPoints > 70 ? 'CRITICAL' : transPoints > 45 ? 'HIGH' : transPoints > 25 ? 'MEDIUM' : 'LOW',
    factors: transFactors.length > 0 ? transFactors : ['Direct 1:1 schema field alignment without complex parsing'],
    remediation: profile.sampleData.hasPiiData
      ? 'Deploy a Dedicated Tokenization Service (Vault or KMS Envelope Encryption) with strict audit logging on decrypted fields.'
      : 'Use compiled JSON schema mappers for microsecond transformation throughput.',
  };

  // 5. Deployment Complexity (Weight: 14%)
  let deployPoints = 15;
  const deployFactors: string[] = [];
  if (profile.deployment.target === 'hybrid') {
    deployPoints += 50;
    deployFactors.push('Hybrid on-prem / cloud deployment requiring dual CI/CD pipelines and VPN gateways');
  } else if (profile.deployment.target === 'kubernetes_onprem') {
    deployPoints += 40;
    deployFactors.push('Self-managed Kubernetes cluster with ingress controller and storage class variability');
  }
  if (profile.availability.multiRegionActiveActive) {
    deployPoints += 25;
    deployFactors.push('Multi-region active-active deployment requiring cross-region data replication and global DNS routing');
  }
  if (!profile.database.schemaMigrationAllowed) {
    deployPoints += 20;
    deployFactors.push('Customer CAB locks schema migrations: zero DDL changes permitted during standard deployments');
  }
  deployPoints = Math.min(100, Math.max(0, deployPoints));
  const deployCat: FrictionCategoryScore = {
    id: 'deploymentComplexity',
    name: 'Deployment Complexity',
    score: deployPoints,
    weight: 0.14,
    riskLevel: deployPoints > 70 ? 'CRITICAL' : deployPoints > 45 ? 'HIGH' : deployPoints > 25 ? 'MEDIUM' : 'LOW',
    factors: deployFactors.length > 0 ? deployFactors : ['Standard single-region cloud native compute with automated CI/CD'],
    remediation: !profile.database.schemaMigrationAllowed
      ? 'Implement Expand/Contract schema pattern; decouple app deployments completely from database schema changes.'
      : 'Maintain immutable Terraform / Bicep modules with automated pre-deployment drift detection.',
  };

  // 6. Network Restrictions (Weight: 14%)
  let netPoints = 10;
  const netFactors: string[] = [];
  if (profile.networking.type === 'airgapped_dmz') {
    netPoints += 75;
    netFactors.push('Airgapped DMZ with zero direct internet or cloud connectivity');
  } else if (profile.networking.type === 'cloud_privatelink') {
    netPoints += 45;
    netFactors.push('PrivateLink requires cross-account VPC Endpoint Services, NLB provisioning, and DNS zone associations');
  } else if (profile.networking.type === 'forward_egress_proxy') {
    netPoints += 40;
    netFactors.push('Strict forward egress proxy inspecting TLS SNI with potential certificate pinning blocks');
  } else if (profile.networking.type === 'ip_allowlisting') {
    netPoints += 30;
    netFactors.push('Static IP allowlisting requires dedicated NAT Gateways, Elastic IPs, and brittle customer firewall tickets');
  }
  if (profile.networking.strictEgressFirewall) {
    netPoints += 20;
    netFactors.push('Strict outbound firewall rules preventing arbitrary egress calls');
  }
  if (profile.networking.customDnsResolution) {
    netPoints += 15;
    netFactors.push('Custom internal DNS resolution required (Split-Horizon Route53 / Azure Private DNS Zones)');
  }
  netPoints = Math.min(100, Math.max(0, netPoints));
  const netCat: FrictionCategoryScore = {
    id: 'networkRestrictions',
    name: 'Network Restrictions',
    score: netPoints,
    weight: 0.14,
    riskLevel: netPoints > 70 ? 'CRITICAL' : netPoints > 45 ? 'HIGH' : netPoints > 25 ? 'MEDIUM' : 'LOW',
    factors: netFactors.length > 0 ? netFactors : ['Direct HTTPS egress with standard cloud DNS resolution'],
    remediation: profile.networking.type === 'cloud_privatelink'
      ? 'Pre-share Terraform module for Endpoint Service acceptance and exchange AWS Account IDs / Resource Names in Sprint 0.'
      : 'Provide dedicated static egress IP pool and automate periodic health checks to firewall gateways.',
  };

  // 7. Operational Risk (Weight: 10%)
  let opPoints = 10;
  const opFactors: string[] = [];
  if (profile.rateLimits.rpsLimit <= 20) {
    opPoints += 35;
    opFactors.push(`Extremely tight rate limit cap (${profile.rateLimits.rpsLimit} RPS): high probability of 429 throttling`);
  }
  if (!profile.rateLimits.hasRetryAfterHeader) {
    opPoints += 20;
    opFactors.push('Missing Retry-After header: client must guess backoff intervals, causing herd-bursting');
  }
  if (profile.webhook.enabled && profile.webhook.deliveryGuarantee === 'best_effort') {
    opPoints += 30;
    opFactors.push('Webhook delivery is best-effort with no retry guarantee: event loss during downstream hiccups');
  }
  if (profile.webhook.retryBackoff === 'none' && profile.webhook.enabled) {
    opPoints += 25;
    opFactors.push('Zero retry backoff on webhook failures creates operational blind spots');
  }
  if (!profile.database.connectionPoolConfigured) {
    opPoints += 25;
    opFactors.push('No database connection pooling: risk of backend database starvation during traffic spikes');
  }
  opPoints = Math.min(100, Math.max(0, opPoints));
  const opCat: FrictionCategoryScore = {
    id: 'operationalRisk',
    name: 'Operational Risk',
    score: opPoints,
    weight: 0.10,
    riskLevel: opPoints > 70 ? 'CRITICAL' : opPoints > 45 ? 'HIGH' : opPoints > 25 ? 'MEDIUM' : 'LOW',
    factors: opFactors.length > 0 ? opFactors : ['Robust rate limit headroom and fault-tolerant retry semantics'],
    remediation: profile.rateLimits.rpsLimit <= 20
      ? 'Introduce an asynchronous message buffer (SQS/PubSub) with rate-controlled worker pools to pace outbound requests.'
      : 'Deploy PgBouncer / RDS Proxy to insulate the relational database from connection exhaustion.',
  };

  // 8. Security Risk (Weight: 12%)
  let secPoints = 10;
  const secFactors: string[] = [];
  if (profile.auth.mechanism === 'basic_auth_deprecated') {
    secPoints += 60;
    secFactors.push('Cleartext Basic Auth credentials passed across requests without token ephemeral lifespan');
  }
  if (profile.webhook.enabled && !profile.webhook.hasHmacSignature) {
    secPoints += 50;
    secFactors.push('Webhooks lack HMAC cryptographic signature verification: vulnerability to spoofed webhook payloads');
  }
  if (profile.sampleData.hasPiiData && !profile.compliance.soc2 && !profile.compliance.hipaa) {
    secPoints += 30;
    secFactors.push('Sensitive PII ingested without certified compliance boundary governance');
  }
  if (profile.compliance.hipaa && profile.deployment.target !== 'azure' && profile.deployment.target !== 'aws') {
    secPoints += 25;
    secFactors.push('HIPAA environment requires verified signed Business Associate Agreement (BAA)');
  }
  secPoints = Math.min(100, Math.max(0, secPoints));
  const secCat: FrictionCategoryScore = {
    id: 'securityRisk',
    name: 'Security Risk',
    score: secPoints,
    weight: 0.12,
    riskLevel: secPoints > 70 ? 'CRITICAL' : secPoints > 45 ? 'HIGH' : secPoints > 25 ? 'MEDIUM' : 'LOW',
    factors: secFactors.length > 0 ? secFactors : ['Strong zero-trust architecture, signed webhooks, and encrypted transports'],
    remediation: !profile.webhook.hasHmacSignature && profile.webhook.enabled
      ? 'BLOCKER: Enforce SHA-256 HMAC signature validation in X-Signature header before accepting webhook bodies.'
      : 'Enforce annual automated KMS key rotation and least-privilege IAM roles with condition keys.',
  };

  // Weighted Composite Calculation
  const composite =
    schemaCat.score * schemaCat.weight +
    authCat.score * authCat.weight +
    apiCat.score * apiCat.weight +
    transCat.score * transCat.weight +
    deployCat.score * deployCat.weight +
    netCat.score * netCat.weight +
    opCat.score * opCat.weight +
    secCat.score * secCat.weight;

  const overallScore = Math.round(composite);

  let level: 'Low Friction' | 'Moderate Friction' | 'High Friction' | 'Critical Friction' = 'Low Friction';
  if (overallScore > 75) level = 'Critical Friction';
  else if (overallScore > 55) level = 'High Friction';
  else if (overallScore > 30) level = 'Moderate Friction';

  // Key drivers
  const categoriesList = [schemaCat, authCat, apiCat, transCat, deployCat, netCat, opCat, secCat];
  categoriesList.sort((a, b) => b.score - a.score);
  const keyDrivers = categoriesList
    .slice(0, 3)
    .map((c) => `${c.name} (${c.score}/100) — ${c.factors[0] || 'High friction factor'}`);

  const quickWins: string[] = [];
  if (!profile.apiSpec.hasIdempotencyKeys) {
    quickWins.push('Implement Redis-based 24h request deduplication header (X-Idempotency-Key) on API gateway');
  }
  if (!profile.database.connectionPoolConfigured) {
    quickWins.push('Deploy connection pooler (e.g. PgBouncer / RDS Proxy) to prevent DB saturation during bursts');
  }
  if (profile.sampleData.hasTimestampMismatch) {
    quickWins.push('Add pre-ingestion ISO-8601 normalizer filter to prevent date parsing exceptions');
  }
  if (profile.rateLimits.rpsLimit <= 50) {
    quickWins.push('Add SQS/PubSub rate-limiting queue buffer with leaky-bucket worker pacing');
  }
  if (profile.webhook.enabled && !profile.webhook.hasHmacSignature) {
    quickWins.push('Mandate HMAC-SHA256 signature verification in webhook callback ingress filter');
  }

  let summary = '';
  if (overallScore <= 35) {
    summary = 'Low implementation friction. Target environment aligns closely with modern cloud and API patterns. Estimated ramp-up is within standard pilot velocity.';
  } else if (overallScore <= 60) {
    summary = 'Moderate integration complexity. Key friction points exist around network topologies, custom payload mappings, or token lifecycles, requiring structured engineering plumbing.';
  } else if (overallScore <= 80) {
    summary = 'High operational and architectural friction. Multiple tight constraints (strict rate limits, mTLS/PrivateLink, legacy schemas) require dedicated FDE solutions work before traffic can flow.';
  } else {
    summary = 'Critical integration barriers identified. Foundational architectural constraints, legacy protocols, or critical security vulnerabilities must be resolved before proceeding.';
  }

  return {
    overallScore,
    level,
    summary,
    categories: {
      schemaMismatch: schemaCat,
      authenticationComplexity: authCat,
      apiComplexity: apiCat,
      transformationEffort: transCat,
      deploymentComplexity: deployCat,
      networkRestrictions: netCat,
      operationalRisk: opCat,
      securityRisk: secCat,
    },
    keyDrivers,
    recommendedQuickWins: quickWins.slice(0, 4),
  };
}
