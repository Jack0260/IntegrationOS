export type RoleType =
  | 'fde'
  | 'solutions_architect'
  | 'backend_engineer'
  | 'software_engineer'
  | 'cloud_engineer'
  | 'platform_engineer'
  | 'devops_engineer'
  | 'business_analyst'
  | 'data_engineer'
  | 'cybersecurity_engineer';

export type DeploymentTarget = 'aws' | 'azure' | 'gcp' | 'kubernetes_onprem' | 'hybrid';

export type AuthMechanism =
  | 'api_keys'
  | 'oauth2_client_credentials'
  | 'oauth2_auth_code'
  | 'mtls'
  | 'saml_oidc_sso'
  | 'hmac_signed'
  | 'aws_sigv4'
  | 'basic_auth_deprecated';

export type NetworkingType =
  | 'public_internet'
  | 'ip_allowlisting'
  | 'vpc_peering'
  | 'cloud_privatelink'
  | 'forward_egress_proxy'
  | 'airgapped_dmz';

export type WebhookDelivery = 'at_least_once' | 'at_most_once' | 'best_effort' | 'fifo_deduped';

export type DatabaseEngine =
  | 'postgresql'
  | 'aurora_postgres'
  | 'dynamodb'
  | 'mongodb'
  | 'bigquery'
  | 'snowflake'
  | 'oracle_onprem'
  | 'sql_server';

export interface CustomerProfile {
  id: string;
  name: string;
  industry: string;
  tier: 'Enterprise Tier-1' | 'Mid-Market' | 'Growth' | 'Regulated / Gov';
  summary: string;
  targetGoLiveDate: string;
  
  // API Specification
  apiSpec: {
    format: 'OpenAPI 3.1' | 'GraphQL' | 'gRPC' | 'Custom REST' | 'SOAP / XML' | 'Batch CSV / SFTP';
    endpointsCount: number;
    hasPagination: boolean;
    hasIdempotencyKeys: boolean;
    specSnippet: string;
  };

  // Sample Data & Schema
  sampleData: {
    format: 'JSON' | 'CSV' | 'XML' | 'Protobuf';
    rawPayload: string;
    fieldsCount: number;
    hasNestedArrays: boolean;
    hasTimestampMismatch: boolean; // e.g. epoch vs ISO-8601
    hasCasingMismatch: boolean; // camelCase vs snake_case
    hasPiiData: boolean;
  };

  // Auth Mechanism
  auth: {
    mechanism: AuthMechanism;
    tokenLifetimeMinutes: number;
    rotationPolicy: string;
    clientCertRequired: boolean;
    ssoProvider?: string;
  };

  // Rate Limits
  rateLimits: {
    rpsLimit: number;
    peakRps: number;
    burstLimit: number;
    quotaWindow: string; // e.g. "per second", "per minute"
    enforcesConcurrencyCap: boolean;
    maxConcurrentRequests: number;
    hasRetryAfterHeader: boolean;
  };

  // Networking Restrictions
  networking: {
    type: NetworkingType;
    strictEgressFirewall: boolean;
    customDnsResolution: boolean;
    vpnRequired: boolean;
    allowedCidrs: string[];
    mtuLimitBytes?: number;
  };

  // Webhook Behavior
  webhook: {
    enabled: boolean;
    deliveryGuarantee: WebhookDelivery;
    retryBackoff: 'exponential' | 'linear' | 'none';
    maxRetries: number;
    hasHmacSignature: boolean;
    secretRotationSupported: boolean;
    timeoutSeconds: number;
  };

  // Database Info
  database: {
    engine: DatabaseEngine;
    connectionPoolConfigured: boolean;
    maxConnections: number;
    readReplicasAvailable: boolean;
    cdcEnabled: boolean;
    schemaMigrationAllowed: boolean;
  };

  // Deployment Target
  deployment: {
    target: DeploymentTarget;
    region: string;
    computePlatform: string;
    secretsManager: string;
    useManagedWaf: boolean;
  };

  // Compliance
  compliance: {
    soc2: boolean;
    hipaa: boolean;
    pciDss: boolean;
    gdpr: boolean;
    fedramp: boolean;
    dataResidencyCountry: string;
  };

  // Expected Traffic
  traffic: {
    averageRps: number;
    peakRps: number;
    avgPayloadKb: number;
    trafficPattern: 'steady' | 'bursty' | 'batch_nightly' | 'seasonal';
  };

  // Availability Requirements
  availability: {
    slaTarget: '99.9%' | '99.95%' | '99.99%' | '99.999%';
    rtoHours: number;
    rpoMinutes: number;
    multiRegionActiveActive: boolean;
  };

  // Assumptions & Discovery Notes
  assumptions: AssumptionItem[];
  discoveryNotes: string;
}

export interface AssumptionItem {
  id: string;
  statement: string;
  confidence: 'High' | 'Medium' | 'Speculative';
  owner: string;
  validated: boolean;
  riskIfFalse: string;
}

export interface FrictionCategoryScore {
  id: string;
  name: string;
  score: number; // 0 - 100
  weight: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  remediation: string;
}

export interface FrictionAnalysis {
  overallScore: number; // 0 - 100
  level: 'Low Friction' | 'Moderate Friction' | 'High Friction' | 'Critical Friction';
  summary: string;
  categories: {
    schemaMismatch: FrictionCategoryScore;
    authenticationComplexity: FrictionCategoryScore;
    apiComplexity: FrictionCategoryScore;
    transformationEffort: FrictionCategoryScore;
    deploymentComplexity: FrictionCategoryScore;
    networkRestrictions: FrictionCategoryScore;
    operationalRisk: FrictionCategoryScore;
    securityRisk: FrictionCategoryScore;
  };
  keyDrivers: string[];
  recommendedQuickWins: string[];
}

export interface DataMappingItem {
  id: string;
  sourceField: string;
  sourceType: string;
  targetField: string;
  targetType: string;
  transformation: string;
  nullSafetyRule: string;
  isPii: boolean;
  status: 'Mapped' | 'Needs Validation' | 'Type Mismatch';
}

export interface ArchitectureNode {
  id: string;
  label: string;
  category: 'ingress' | 'identity' | 'gateway' | 'compute' | 'storage' | 'security' | 'observability';
  serviceName: string; // e.g. "AWS API Gateway"
  cloudProvider: 'aws' | 'azure' | 'gcp' | 'generic';
  description: string;
  status: 'Ready' | 'Config Required' | 'High Friction' | 'Blocked';
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  protocol: string; // e.g. "mTLS / HTTPS", "gRPC", "AMQP"
  latencyEst: string;
}

export interface IntegrationStep {
  phase: number;
  phaseName: string;
  stepNumber: string;
  title: string;
  ownerRole: RoleType;
  durationDays: number;
  prerequisites: string[];
  deliverable: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

export interface DeploymentSequenceItem {
  order: number;
  component: string;
  action: string;
  iacTool: 'Terraform' | 'CloudFormation' | 'Bicep' | 'Helm';
  validationCheck: string;
  rollbackAction: string;
}

export interface TestingChecklistItem {
  id: string;
  category: 'Unit & Contract' | 'Security & Auth' | 'Network & PrivateLink' | 'Load & Burst' | 'Chaos & Failover';
  testName: string;
  verificationMethod: string;
  tooling: string;
  requiredForGoLive: boolean;
  status: 'Passed' | 'Ready' | 'Blocked';
}

export interface RollbackPlanStep {
  triggerCondition: string;
  stepNumber: number;
  action: string;
  maxRtoMinutes: number;
  dataIntegrityProtection: string;
}

export interface UnresolvedQuestion {
  id: string;
  question: string;
  urgency: 'Blocker' | 'High' | 'Medium' | 'Low';
  stakeholder: 'Customer Security' | 'Customer DevOps' | 'Customer Architecture' | 'Internal Lead';
  assignedRole: RoleType;
  resolutionStatus: 'Open' | 'Pending Meeting' | 'Resolved';
}

export interface ImplementationBlueprint {
  targetArchitecture: {
    provider: DeploymentTarget;
    topologyTitle: string;
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  };
  dataMappings: DataMappingItem[];
  integrationSteps: IntegrationStep[];
  deploymentSequence: DeploymentSequenceItem[];
  testingChecklist: TestingChecklistItem[];
  rollbackPlan: RollbackPlanStep[];
  unresolvedQuestions: UnresolvedQuestion[];
}

export type ImpactNodeId =
  | 'customer'
  | 'identity'
  | 'api'
  | 'data_transformation'
  | 'internal_service'
  | 'database'
  | 'monitoring';

export interface ImpactNodeState {
  nodeId: ImpactNodeId;
  label: string;
  status: 'affected' | 'reconfigured' | 'high_risk' | 'unchanged';
  changeTitle: string;
  detail: string;
  codeChanges: string[];
  latencyDeltaMs: number;
  costDeltaMonthlyUsd: number;
  timelineDelayDays: number;
}

export interface RequirementChangePreset {
  id: string;
  title: string;
  description: string;
  category: 'Auth' | 'Networking' | 'Rate Limits' | 'Compliance' | 'Payload' | 'Database';
  nodeImpacts: Record<ImpactNodeId, ImpactNodeState>;
  overallDelayDays: number;
  overallCostDeltaUsd: number;
  securityImpactSummary: string;
}

export interface DefensiveSecurityCheck {
  id: string;
  title: string;
  category: 'Weak Auth' | 'Missing TLS' | 'Excessive Permissions' | 'Sensitive Data Exposure' | 'Unsafe Configuration';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detected: boolean;
  explanation: string;
  remediationRecipe: string;
  cliVerificationCommand: string;
}

export interface ReadinessEvidenceItem {
  id: string;
  category: 'Networking' | 'Authentication' | 'Schema & Data' | 'Operational' | 'Compliance';
  check: string;
  verdict: 'PASS' | 'WARN' | 'FAIL';
  evidence: string;
  remediationIfFail?: string;
}

export interface ReadinessReport {
  status: 'READY' | 'READY WITH CONDITIONS' | 'BLOCKED';
  confidencePercentage: number;
  timeToFirstRequest: string;
  executiveSummary: string;
  hardBlockers: string[];
  mandatoryConditions: string[];
  evidenceLedger: ReadinessEvidenceItem[];
  generatedTimestamp: string;
}

export interface SeniorModeTradeoff {
  decision: string;
  optionA: { name: string; pros: string[]; cons: string[] };
  optionB: { name: string; pros: string[]; cons: string[] };
  recommendation: string;
}

export interface FailureDomainItem {
  domain: string;
  failureScenario: string;
  blastRadius: 'Single Request' | 'Batch Sync' | 'Service Degradation' | 'Total Outage';
  containmentStrategy: string;
  circuitBreakerThreshold: string;
}

export interface ObservabilityMetricItem {
  signalType: 'Latency' | 'Traffic' | 'Errors' | 'Saturation';
  metricName: string;
  otelSpanOrPrometheus: string;
  targetThreshold: string;
  alertPriority: 'P1 (PagerDuty)' | 'P2 (Slack)' | 'P3 (Dashboard)';
}

export interface SeniorModeData {
  tradeoffs: SeniorModeTradeoff[];
  failureDomains: FailureDomainItem[];
  deploymentCost: {
    monthlyEstimateUsd: number;
    breakdown: { item: string; costUsd: number; explanation: string }[];
  };
  observabilityPlan: {
    goldenSignals: ObservabilityMetricItem[];
    loggingSchema: string;
    tracingPropagation: string;
  };
  disasterRecovery: {
    rtoHours: number;
    rpoMinutes: number;
    failoverProcedure: string[];
    multiRegionTopology: string;
  };
  threatModelStride: {
    threatCategory: 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information Disclosure' | 'Denial of Service' | 'Elevation of Privilege';
    attackVector: string;
    mitigationControl: string;
    residualRisk: 'Low' | 'Medium' | 'High';
  }[];
  scalingPlan: {
    bottleneckComponent: string;
    limitThreshold: string;
    autoscalingTrigger: string;
    mitigationPath: string;
  }[];
  supportHandoff: {
    tier1Runbook: string[];
    commonErrorTaxonomy: { code: string; meaning: string; triageAction: string }[];
    escalationMatrix: string;
  };
}
