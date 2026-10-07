import { CustomerProfile, SeniorModeData } from '../types/integration';

export function generateSeniorModeData(profile: CustomerProfile): SeniorModeData {
  const isAws = profile.deployment.target === 'aws';
  const isAzure = profile.deployment.target === 'azure';
  const isGcp = profile.deployment.target === 'gcp';

  // 1. Architecture Tradeoffs
  const tradeoffs = [
    {
      decision: 'Synchronous REST vs Asynchronous Event Buffering',
      optionA: {
        name: 'Direct Synchronous HTTPS',
        pros: ['Immediate consistency response', 'Simple client programming model', 'Zero message broker cost'],
        cons: ['Tight temporal coupling', 'Vulnerable to customer rate limit exhaustion', 'Cascading latency failures'],
      },
      optionB: {
        name: 'Decoupled SQS / PubSub Queue with Webhook Callback',
        pros: ['Protects customer backend at burst times', 'Guaranteed at-least-once delivery', 'Independent worker scaling'],
        cons: ['Eventual consistency model', 'Client must support async webhook or polling', 'Requires dead-letter queue management'],
      },
      recommendation: profile.rateLimits.rpsLimit <= 100
        ? 'RECOMMEND OPTION B (Asynchronous Queue Buffer): Due to the strict customer rate limit cap, synchronous calling will cause high 429 error cascades during bursts.'
        : 'RECOMMEND OPTION A (Synchronous Ingress) with SQS asynchronous offload for analytical auditing only.',
    },
    {
      decision: 'Rate Limiting Architecture: In-Memory vs Distributed Token Bucket',
      optionA: {
        name: 'Distributed Redis Cluster Token Bucket',
        pros: ['Global cluster-wide precision across all worker instances', 'Exact adherence to SLA quotas'],
        cons: ['Additional Redis network hop (1-2ms latency)', 'Redis availability dependency'],
      },
      optionB: {
        name: 'Per-Pod In-Memory Sliding Window',
        pros: ['Sub-millisecond local evaluation', 'Zero external infrastructure dependency'],
        cons: ['Inaccurate quota enforcement as pod counts scale dynamically', 'Risk of quota bursts under autoscaling'],
      },
      recommendation: 'RECOMMEND OPTION A (Distributed Redis): Multi-instance horizontal scaling will violate customer SLAs if per-node quota fragmentation occurs.',
    },
    {
      decision: 'Transport Security: Mutual TLS (mTLS) vs Application-Layer HMAC',
      optionA: {
        name: 'Hardware Mutual TLS (mTLS) Termination',
        pros: ['Zero-trust cryptographic handshake at network layer', 'Non-forgeable machine identity'],
        cons: ['Certificate lifecycle management overhead', 'Cannot inspect payloads prior to TLS handshake'],
      },
      optionB: {
        name: 'HMAC-SHA256 Signed Body Headers',
        pros: ['Works over any standard reverse proxy', 'Payload-level non-repudiation', 'Easier debugging'],
        cons: ['Requires reading entire request body into memory before verification', 'Susceptible to replay if timestamp window loose'],
      },
      recommendation: profile.auth.mechanism === 'mtls'
        ? 'RECOMMEND OPTION A: Customer enterprise security policy strictly dictates client certificate exchange.'
        : 'RECOMMEND DUAL-LAYER: OAuth2 Bearer Tokens for authentication combined with HMAC signatures for high-value webhook callbacks.',
    },
  ];

  // 2. Failure Domains & Blast Radius
  const failureDomains = [
    {
      domain: 'Customer IdP / Token Issuer Outage',
      failureScenario: 'Customer PingFederate / Okta / Entra ID service experiences network disruption or 503 errors.',
      blastRadius: 'Total Outage' as const,
      containmentStrategy: 'Graceful token cache extension: allow valid cached JWTs to serve read traffic for up to 10 minutes past expiration with emergency audit warning.',
      circuitBreakerThreshold: 'Trip circuit breaker after 5 consecutive IdP 5xx errors; return HTTP 503 with Retry-After: 60.',
    },
    {
      domain: 'Customer Rate Limit 429 Throttle Burst',
      failureScenario: 'Upstream customer endpoint returns HTTP 429 Too Many Requests during high-volume settlement/checkout window.',
      blastRadius: 'Service Degradation' as const,
      containmentStrategy: 'Exponential backoff with full jitter (Decorrelated Jitter algorithm); throttle ingestion consumer threads.',
      circuitBreakerThreshold: 'Halt outbound dispatch when 429 rate exceeds 8% over 30 seconds; backlog buffered safely in queue.',
    },
    {
      domain: 'Relational Database Connection Starvation',
      failureScenario: 'Spike in traffic exhausts active connection pool; queries begin queueing with connection acquisition timeouts.',
      blastRadius: 'Total Outage' as const,
      containmentStrategy: 'PgBouncer / AWS RDS Proxy connection pooling; immediate shedding of non-essential background reporting queries.',
      circuitBreakerThreshold: 'Reject non-critical endpoints when active DB connection pool utilization exceeds 85%.',
    },
    {
      domain: 'Mismatched Payload Schema Ingestion',
      failureScenario: 'Customer deploys unannounced breaking change to timestamp format or removes mandatory foreign key ID.',
      blastRadius: 'Batch Sync' as const,
      containmentStrategy: 'Validation failure routes message directly to Dead-Letter Queue (DLQ) with raw payload snapshot; processing continues for valid messages.',
      circuitBreakerThreshold: 'Alert PagerDuty if DLQ ingestion rate exceeds 20 items per minute.',
    },
  ];

  // 3. Deployment Cost Estimate
  const computeCost = isAws ? 320 : isAzure ? 310 : 280;
  const networkingCost = profile.networking.type === 'cloud_privatelink' ? 240 : 90;
  const dbCost = profile.database.engine === 'aurora_postgres' ? 450 : profile.database.engine === 'bigquery' ? 380 : 260;
  const securityVaultCost = 85;
  const observabilityCost = 160;
  const totalCost = computeCost + networkingCost + dbCost + securityVaultCost + observabilityCost;

  const deploymentCost = {
    monthlyEstimateUsd: totalCost,
    breakdown: [
      {
        item: isAws ? 'AWS ECS Fargate Container Tasks (4 tasks, 2 vCPU / 4GB)' : isAzure ? 'Azure Container Apps Dedicated Environment' : 'Google Cloud Run v2 (Multi-Region)',
        costUsd: computeCost,
        explanation: 'Stateless worker pools auto-scaling between baseline and peak traffic windows.',
      },
      {
        item: profile.networking.type === 'cloud_privatelink'
          ? (isAws ? 'AWS VPC Endpoint Service & NLB Hourly + Data Processing' : 'Azure Private Link & Private Endpoints')
          : 'NAT Gateway Data Processing & Elastic IPs',
        costUsd: networkingCost,
        explanation: 'Secure private network plumbing across VPC boundaries without public internet egress.',
      },
      {
        item: `${profile.database.engine.toUpperCase()} Managed Database Tier`,
        costUsd: dbCost,
        explanation: 'Multi-AZ instance sizing with automated automated daily snapshots and KMS encryption.',
      },
      {
        item: isAws ? 'AWS Secrets Manager & KMS CMK API Calls' : isAzure ? 'Azure Key Vault & Managed Identities' : 'GCP Secret Manager & Cloud KMS',
        costUsd: securityVaultCost,
        explanation: 'Secure storage and automated rotation for mTLS certs, OAuth secrets, and tokenization keys.',
      },
      {
        item: 'Observability & Metrics Ingestion (Datadog / CloudWatch / Otel)',
        costUsd: observabilityCost,
        explanation: 'High-cardinality distributed traces, log retention for 90 days, and synthetic probes.',
      },
    ],
  };

  // 4. Observability Plan
  const observabilityPlan = {
    goldenSignals: [
      {
        signalType: 'Latency' as const,
        metricName: 'http_request_duration_seconds{quantile="0.99"}',
        otelSpanOrPrometheus: 'integration_gateway_span_duration_ms',
        targetThreshold: '< 180ms p99',
        alertPriority: 'P1 (PagerDuty)' as const,
      },
      {
        signalType: 'Traffic' as const,
        metricName: 'http_requests_total{status=~"2.."}',
        otelSpanOrPrometheus: 'integration_inbound_throughput_rps',
        targetThreshold: `Sustained baseline: ${profile.traffic.averageRps} RPS`,
        alertPriority: 'P3 (Dashboard)' as const,
      },
      {
        signalType: 'Errors' as const,
        metricName: 'http_requests_total{status=~"5.." | status="429"}',
        otelSpanOrPrometheus: 'integration_error_rate_percentage',
        targetThreshold: '< 0.05% error rate',
        alertPriority: 'P1 (PagerDuty)' as const,
      },
      {
        signalType: 'Saturation' as const,
        metricName: 'db_connection_pool_active / db_connection_pool_max',
        otelSpanOrPrometheus: 'database_pool_utilization_ratio',
        targetThreshold: '< 75% utilization',
        alertPriority: 'P2 (Slack)' as const,
      },
    ],
    loggingSchema: `{
  "timestamp": "2026-10-06T21:00:00.000Z",
  "level": "INFO",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "customerId": "${profile.id}",
  "endpoint": "/v2/settlements/execute",
  "httpStatus": 200,
  "durationMs": 42.1,
  "idempotencyKey": "uuid-v4-redacted",
  "sanitizedPayloadHash": "sha256:e3b0c44298fc1c149afbf4c8996fb924"
}`,
    tracingPropagation: 'W3C TraceContext (traceparent & tracestate) forwarded across all HTTP, gRPC, and SQS/PubSub headers.',
  };

  // 5. Disaster Recovery (DR) Plan
  const disasterRecovery = {
    rtoHours: profile.availability.rtoHours,
    rpoMinutes: profile.availability.rpoMinutes,
    failoverProcedure: [
      'Step 1: Automated Health Check in primary region fails 3 consecutive 10-second TCP probes.',
      'Step 2: Global Route53 Application Recovery Controller (ARC) switches DNS routing policy to Secondary Region.',
      'Step 3: Secondary Database Read Replica promoted to Primary Master in < 120 seconds.',
      'Step 4: Queue worker consumers spun up in Secondary Region; replay unprocessed event stream from S3/Kafka cold buffer.',
      'Step 5: Post-incident reconciliation script verifies zero duplicate records or missing ledger balances.',
    ],
    multiRegionTopology: profile.availability.multiRegionActiveActive
      ? 'Active-Active Multi-Region with Amazon Aurora Global Database / Azure Cosmos Multi-Write and Anycast Route53 routing.'
      : 'Active-Passive Warm Standby in secondary cloud region with automated cross-region snapshot replication every 15 minutes.',
  };

  // 6. Threat Model (STRIDE)
  const threatModelStride = [
    {
      threatCategory: 'Spoofing' as const,
      attackVector: 'Adversary attempts to impersonate customer backend to inject forged financial / clinical transactions.',
      mitigationControl: profile.auth.mechanism === 'mtls'
        ? 'Mutual TLS with customer Private CA certificate pinning; unauthorized handshakes terminated at Layer 4.'
        : 'Strict OAuth 2.0 asymmetric JWT signature verification (RS256) checking issuer and audience claims.',
      residualRisk: 'Low' as const,
    },
    {
      threatCategory: 'Tampering' as const,
      attackVector: 'Man-in-the-middle or malicious proxy alters transaction amounts or beneficiary account numbers in flight.',
      mitigationControl: 'End-to-end TLS 1.3 encryption with strict forward secrecy + HMAC-SHA256 payload checksum validation.',
      residualRisk: 'Low' as const,
    },
    {
      threatCategory: 'Repudiation' as const,
      attackVector: 'Customer claims an order or clearing transaction was never transmitted or was initiated by vendor.',
      mitigationControl: 'Immutable WORM audit log in S3 Object Lock / Azure Immutable Blob with cryptographic message hash and timestamp.',
      residualRisk: 'Low' as const,
    },
    {
      threatCategory: 'Information Disclosure' as const,
      attackVector: 'Unmasked PII / SSN / PHI leaks into CloudWatch logs or Datadog telemetry dashboards.',
      mitigationControl: 'Application logging interceptor automatically scrubs matching regexes; KMS envelope encryption for DB fields.',
      residualRisk: 'Medium' as const,
    },
    {
      threatCategory: 'Denial of Service' as const,
      attackVector: 'Volumetric layer 7 HTTP flood or malformed JSON zip bomb crashes worker memory.',
      mitigationControl: 'Cloud WAF rate limiting rules + max request body size hard capped at 1MB with streaming JSON parser.',
      residualRisk: 'Low' as const,
    },
    {
      threatCategory: 'Elevation of Privilege' as const,
      attackVector: 'Scoped read-only integration token attempts write mutations on financial settlement paths.',
      mitigationControl: 'Fine-grained OAuth 2.0 scope enforcement on every route (e.g. write:settlements required for POST).',
      residualRisk: 'Low' as const,
    },
  ];

  // 7. Scaling Plan
  const scalingPlan = [
    {
      bottleneckComponent: 'Stateless Worker Processing Tier',
      limitThreshold: 'CPU utilization > 65% or SQS Queue Depth > 500 messages',
      autoscalingTrigger: 'KEDA / AWS Auto Scaling scales worker tasks from 4 to 32 instances in < 45 seconds.',
      mitigationPath: 'Pre-warm container tasks 15 minutes prior to known customer clearing windows.',
    },
    {
      bottleneckComponent: 'Relational Database Connection Pool',
      limitThreshold: 'Active DB connections > 80% of max_connections',
      autoscalingTrigger: 'PgBouncer multiplexing + RDS Aurora auto-scaling read replicas (up to 5 replicas).',
      mitigationPath: 'Route all analytical reporting queries strictly to read-only replica endpoints.',
    },
    {
      bottleneckComponent: 'Customer Ingress Rate Limit (External)',
      limitThreshold: `Outbound request rate approaches ${profile.rateLimits.rpsLimit} RPS`,
      autoscalingTrigger: 'Token bucket leaky-drain algorithm paces outbound dispatch.',
      mitigationPath: 'Buffer excess events into SQS FIFO with 14-day retention rather than dropping.',
    },
  ];

  // 8. Support Handoff
  const supportHandoff = {
    tier1Runbook: [
      '1. Verify customer status on status.vendor.com and status.cloudprovider.com.',
      '2. Query Datadog dashboard "IntegrationOS / Customer Health / ' + profile.name + '" for error spikes.',
      '3. In case of 429 errors: instruct customer that their internal rate limit ceiling has been reached.',
      '4. In case of 401 errors: verify customer client certificate validity date and OAuth client secret rotation date.',
    ],
    commonErrorTaxonomy: [
      {
        code: 'INT-401-CERT-EXPIRED',
        meaning: 'Customer mTLS client certificate has exceeded its validity expiration date.',
        triageAction: 'Contact Customer InfoSec PKI team with certificate serial number to issue refreshed cert.',
      },
      {
        code: 'INT-429-RATE-EXHAUSTED',
        meaning: 'Customer outbound traffic exceeded allocated token bucket quota.',
        triageAction: 'Check if burst is expected; increase rate quota in AWS API Gateway Usage Plan if approved.',
      },
      {
        code: 'INT-422-SCHEMA-MISMATCH',
        meaning: 'Inbound JSON/CSV payload failed strict Zod schema validation rules.',
        triageAction: 'Inspect Dead-Letter Queue event metadata; share field mismatch diff with customer technical lead.',
      },
      {
        code: 'INT-504-UPSTREAM-TIMEOUT',
        meaning: 'Customer internal backend failed to respond within 8,000ms SLA timeout.',
        triageAction: 'Inspect VPC network latency; escalate to Customer Network Operations.',
      },
    ],
    escalationMatrix: 'Tier 1 Support (15m SLA) -> FDE / Solutions Architect (1h SLA) -> Cloud & Platform SRE Lead (Immediate PagerDuty).',
  };

  return {
    tradeoffs,
    failureDomains,
    deploymentCost,
    observabilityPlan,
    disasterRecovery,
    threatModelStride,
    scalingPlan,
    supportHandoff,
  };
}
