import { CustomerProfile } from '../types/integration';

export const mockProfiles: CustomerProfile[] = [
  {
    id: 'fintech-tier1-bank',
    name: 'Apex Global Settlement Bank',
    industry: 'Financial Services & Core Banking',
    tier: 'Enterprise Tier-1',
    summary: 'Cross-border settlement ledger integration connecting on-prem mainframe core banking to cloud transaction processing platform via AWS PrivateLink.',
    targetGoLiveDate: '2026-11-15',
    apiSpec: {
      format: 'OpenAPI 3.1',
      endpointsCount: 28,
      hasPagination: true,
      hasIdempotencyKeys: true,
      specSnippet: `openapi: 3.1.0
info:
  title: Apex Core Clearing API
  version: 2.4.0
paths:
  /v2/settlements/execute:
    post:
      summary: Execute bulk settlement ledger entry
      security:
        - MutualTLS: []
        - OAuth2ClientCreds: [write:settlements]
      parameters:
        - name: X-Idempotency-Key
          in: header
          required: true
          schema:
            type: string
            format: uuid`,
    },
    sampleData: {
      format: 'JSON',
      rawPayload: `{
  "settlement_id": "SET-99482-ZX",
  "source_account_num": "4891002938810294",
  "beneficiary_swift_bic": "CHASUS33XXX",
  "transfer_amount_cents": 145000000,
  "currency_iso": "USD",
  "clearing_timestamp_epoch": 1791283921000,
  "client_tax_id_ssn": "982-12-8823",
  "regulatory_routing_code": "FEDWIRE-021000021"
}`,
      fieldsCount: 8,
      hasNestedArrays: false,
      hasTimestampMismatch: true, // Epoch ms vs Target ISO-8601
      hasCasingMismatch: true, // snake_case vs Target camelCase
      hasPiiData: true, // SSN & Raw Card Account
    },
    auth: {
      mechanism: 'mtls',
      tokenLifetimeMinutes: 15,
      rotationPolicy: '90-day client cert rotation via custom DigiCert PKI',
      clientCertRequired: true,
      ssoProvider: 'PingFederate SAML / OIDC',
    },
    rateLimits: {
      rpsLimit: 50,
      peakRps: 120,
      burstLimit: 150,
      quotaWindow: 'per second',
      enforcesConcurrencyCap: true,
      maxConcurrentRequests: 25,
      hasRetryAfterHeader: true,
    },
    networking: {
      type: 'cloud_privatelink',
      strictEgressFirewall: true,
      customDnsResolution: true,
      vpnRequired: true,
      allowedCidrs: ['10.240.0.0/16', '10.242.12.0/24'],
      mtuLimitBytes: 1500,
    },
    webhook: {
      enabled: true,
      deliveryGuarantee: 'at_least_once',
      retryBackoff: 'exponential',
      maxRetries: 5,
      hasHmacSignature: true,
      secretRotationSupported: true,
      timeoutSeconds: 8,
    },
    database: {
      engine: 'aurora_postgres',
      connectionPoolConfigured: true,
      maxConnections: 1200,
      readReplicasAvailable: true,
      cdcEnabled: true,
      schemaMigrationAllowed: false, // Strict DBA change window
    },
    deployment: {
      target: 'aws',
      region: 'us-east-1',
      computePlatform: 'ECS Fargate + Private Subnets',
      secretsManager: 'AWS Secrets Manager with KMS Customer Managed Key',
      useManagedWaf: true,
    },
    compliance: {
      soc2: true,
      hipaa: false,
      pciDss: true,
      gdpr: true,
      fedramp: false,
      dataResidencyCountry: 'US',
    },
    traffic: {
      averageRps: 35,
      peakRps: 110,
      avgPayloadKb: 14,
      trafficPattern: 'bursty',
    },
    availability: {
      slaTarget: '99.99%',
      rtoHours: 1,
      rpoMinutes: 5,
      multiRegionActiveActive: true,
    },
    assumptions: [
      {
        id: 'asm-1',
        statement: 'Customer Network Engineering will provision AWS VPC Endpoint Service within 10 business days.',
        confidence: 'Medium',
        owner: 'Customer NetOps Lead',
        validated: false,
        riskIfFalse: 'Hard block on pre-production end-to-end handshake testing.',
      },
      {
        id: 'asm-2',
        statement: 'Client certificate SAN fields adhere strictly to RFC 5280 with bank root CA.',
        confidence: 'High',
        owner: 'InfoSec Lead',
        validated: true,
        riskIfFalse: 'TLS handshake failures at API Gateway terminating edge.',
      },
      {
        id: 'asm-3',
        statement: 'Account numbers must be tokenized before persistence in application tables.',
        confidence: 'High',
        owner: 'Compliance Officer',
        validated: true,
        riskIfFalse: 'PCI-DSS DSS Level 1 audit violation and non-compliance penalty.',
      },
    ],
    discoveryNotes: `Initial discovery with VP of Architecture (Marcus Vance) and NetOps Director:
- Bank requires mutual TLS with their internal DigiCert Intermediate CA.
- PrivateLink connection is non-negotiable; zero internet egress permitted.
- DB migrations require 3-week change advisory board approval.
- Peak volume occurs during Fedwire clearing windows (08:30 - 09:30 EST and 16:30 - 17:00 EST).`,
  },
  {
    id: 'healthtech-ehr-provider',
    name: 'CareSync Hospital Systems',
    industry: 'Healthcare & Clinical Informatics',
    tier: 'Regulated / Gov',
    summary: 'Clinical EHR HL7/FHIR record synchronization connecting hospital EHR system to clinical coordination cloud on Microsoft Azure.',
    targetGoLiveDate: '2026-12-01',
    apiSpec: {
      format: 'OpenAPI 3.1',
      endpointsCount: 16,
      hasPagination: true,
      hasIdempotencyKeys: false,
      specSnippet: `openapi: 3.1.0
info:
  title: CareSync FHIR Patient Exchange
  version: 1.2.0
paths:
  /fhir/r4/Patient/{id}/Observation:
    get:
      summary: Retrieve patient clinical observation records
      parameters:
        - name: id
          in: path
          required: true
  /fhir/r4/Encounters/callback:
    post:
      summary: Outbound event notification on admission discharge`,
    },
    sampleData: {
      format: 'JSON',
      rawPayload: `{
  "resourceType": "PatientObservation",
  "patient_mrn": "MRN-8819203",
  "patient_legal_name": "Eleanor Vance",
  "dob": "1968-04-12",
  "icd10_code": "I10",
  "systolic_bp": 142,
  "diastolic_bp": 88,
  "recorded_at": "04/12/2026 14:22:10 EST",
  "practitioner_npi": "1942083719"
}`,
      fieldsCount: 9,
      hasNestedArrays: false,
      hasTimestampMismatch: true, // Custom non-ISO format
      hasCasingMismatch: true, // mixed camelCase / snake_case
      hasPiiData: true, // Patient Legal Name, MRN, DOB (PHI)
    },
    auth: {
      mechanism: 'oauth2_client_credentials',
      tokenLifetimeMinutes: 60,
      rotationPolicy: 'Annual client secret rotation via Azure Key Vault',
      clientCertRequired: false,
      ssoProvider: 'Microsoft Entra ID (Azure AD)',
    },
    rateLimits: {
      rpsLimit: 20,
      peakRps: 45,
      burstLimit: 50,
      quotaWindow: 'per second',
      enforcesConcurrencyCap: true,
      maxConcurrentRequests: 10,
      hasRetryAfterHeader: false,
    },
    networking: {
      type: 'forward_egress_proxy',
      strictEgressFirewall: true,
      customDnsResolution: true,
      vpnRequired: true,
      allowedCidrs: ['172.16.0.0/12'],
    },
    webhook: {
      enabled: true,
      deliveryGuarantee: 'best_effort', // High Risk!
      retryBackoff: 'none', // High Risk!
      maxRetries: 0,
      hasHmacSignature: false, // Critical Security Hole!
      secretRotationSupported: false,
      timeoutSeconds: 5,
    },
    database: {
      engine: 'postgresql',
      connectionPoolConfigured: false,
      maxConnections: 100,
      readReplicasAvailable: false,
      cdcEnabled: false,
      schemaMigrationAllowed: true,
    },
    deployment: {
      target: 'azure',
      region: 'eastus2',
      computePlatform: 'Azure Container Apps + Private VNet',
      secretsManager: 'Azure Key Vault with Managed Identity',
      useManagedWaf: true,
    },
    compliance: {
      soc2: true,
      hipaa: true,
      pciDss: false,
      gdpr: false,
      fedramp: false,
      dataResidencyCountry: 'US',
    },
    traffic: {
      averageRps: 12,
      peakRps: 40,
      avgPayloadKb: 45,
      trafficPattern: 'steady',
    },
    availability: {
      slaTarget: '99.95%',
      rtoHours: 2,
      rpoMinutes: 15,
      multiRegionActiveActive: false,
    },
    assumptions: [
      {
        id: 'asm-care-1',
        statement: 'Business Associate Agreement (BAA) with Microsoft and vendor cloud signed before staging deployment.',
        confidence: 'High',
        owner: 'Hospital Legal Counsel',
        validated: true,
        riskIfFalse: 'HIPAA violation blocker; zero PHI may traverse environment.',
      },
      {
        id: 'asm-care-2',
        statement: 'Hospital proxy permits outbound traffic over port 443 with SNI whitelisting.',
        confidence: 'Medium',
        owner: 'Network Admin',
        validated: false,
        riskIfFalse: 'Connection timeouts during token acquisition from Entra ID.',
      },
      {
        id: 'asm-care-3',
        statement: 'Webhook notifications are acceptable without payload signing if over TLS.',
        confidence: 'Speculative',
        owner: 'Customer Lead Dev',
        validated: false,
        riskIfFalse: 'CRITICAL SECURITY VULNERABILITY: Spoofed encounter callbacks and PHI injection.',
      },
    ],
    discoveryNotes: `Discovery notes with Clinical Integration Architect (Dr. Aris Thorne):
- Must comply with HIPAA Title II administrative and security safeguards.
- Webhook endpoints were set up for legacy system with NO HMAC signature - this is a severe vulnerability flagged by InfoSec.
- No idempotency key support on POST endpoints: risk of duplicate prescription / encounter ingestion!`,
  },
  {
    id: 'global-ecommerce-platform',
    name: 'OmniCart Global Marketplace',
    industry: 'Retail & High-Throughput E-Commerce',
    tier: 'Enterprise Tier-1',
    summary: 'Real-time order orchestration and catalog synchronization on Google Cloud Platform handling peak flash sales and holiday shopping bursts.',
    targetGoLiveDate: '2026-10-30',
    apiSpec: {
      format: 'OpenAPI 3.1',
      endpointsCount: 54,
      hasPagination: true,
      hasIdempotencyKeys: true,
      specSnippet: `openapi: 3.1.0
info:
  title: OmniCart Order Ingestion Stream
  version: 3.0.1
paths:
  /v3/orders/stream:
    post:
      summary: Stream order events with sub-50ms ingestion
      headers:
        X-Idempotency-Key:
          schema: { type: string }`,
    },
    sampleData: {
      format: 'JSON',
      rawPayload: `{
  "orderId": "ORD-2026-9812904",
  "customerId": "CUST-44021",
  "items": [
    { "sku": "SKU-992", "quantity": 2, "unitPrice": 49.99 },
    { "sku": "SKU-104", "quantity": 1, "unitPrice": 129.00 }
  ],
  "totalAmount": 228.98,
  "currency": "USD",
  "createdAt": "2026-10-06T20:15:00.000Z",
  "deliveryCountry": "US"
}`,
      fieldsCount: 7,
      hasNestedArrays: true,
      hasTimestampMismatch: false,
      hasCasingMismatch: false,
      hasPiiData: false,
    },
    auth: {
      mechanism: 'oauth2_client_credentials',
      tokenLifetimeMinutes: 60,
      rotationPolicy: 'Automated 30-day rotation via GCP Secret Manager',
      clientCertRequired: false,
      ssoProvider: 'Google Workspace Cloud Identity',
    },
    rateLimits: {
      rpsLimit: 4500,
      peakRps: 12000,
      burstLimit: 15000,
      quotaWindow: 'per second',
      enforcesConcurrencyCap: false,
      maxConcurrentRequests: 1000,
      hasRetryAfterHeader: true,
    },
    networking: {
      type: 'public_internet',
      strictEgressFirewall: false,
      customDnsResolution: false,
      vpnRequired: false,
      allowedCidrs: ['0.0.0.0/0'],
    },
    webhook: {
      enabled: true,
      deliveryGuarantee: 'fifo_deduped',
      retryBackoff: 'exponential',
      maxRetries: 7,
      hasHmacSignature: true,
      secretRotationSupported: true,
      timeoutSeconds: 3,
    },
    database: {
      engine: 'bigquery',
      connectionPoolConfigured: true,
      maxConnections: 5000,
      readReplicasAvailable: true,
      cdcEnabled: true,
      schemaMigrationAllowed: true,
    },
    deployment: {
      target: 'gcp',
      region: 'us-central1',
      computePlatform: 'Cloud Run Multi-Region + Cloud Pub/Sub',
      secretsManager: 'GCP Secret Manager with automatic replication',
      useManagedWaf: true,
    },
    compliance: {
      soc2: true,
      hipaa: false,
      pciDss: true,
      gdpr: true,
      fedramp: false,
      dataResidencyCountry: 'Global',
    },
    traffic: {
      averageRps: 1800,
      peakRps: 8500,
      avgPayloadKb: 8,
      trafficPattern: 'bursty',
    },
    availability: {
      slaTarget: '99.99%',
      rtoHours: 0.5,
      rpoMinutes: 1,
      multiRegionActiveActive: true,
    },
    assumptions: [
      {
        id: 'asm-omni-1',
        statement: 'Cloud Pub/Sub subscription handles auto-scaling up to 25k pull requests/sec without backlog starvation.',
        confidence: 'High',
        owner: 'GCP SRE Lead',
        validated: true,
        riskIfFalse: 'Message latency exceeds 500ms SLA during Cyber Monday.',
      },
      {
        id: 'asm-omni-2',
        statement: 'Cloud Armor DDoS protection rules pre-configured on Google Cloud Load Balancer.',
        confidence: 'High',
        owner: 'SecOps Team',
        validated: true,
        riskIfFalse: 'Risk of volumetric layer 7 flood saturating Cloud Run instances.',
      },
    ],
    discoveryNotes: `High maturity customer running microservices on GCP.
- Architecture relies heavily on asynchronous event ingestion via Cloud Pub/Sub and BigQuery for analytical feeds.
- Idempotency keys are cleanly transmitted in header.
- Main challenge is extreme scale: bursting from 1,800 to 12,000 RPS in under 90 seconds.`,
  },
  {
    id: 'legacy-logistics-corp',
    name: 'FreightLink National Transit',
    industry: 'Supply Chain & Freight Logistics',
    tier: 'Mid-Market',
    summary: 'Legacy ERP & AS400 tracking integration relying on on-premise SOAP/XML web services, static IP whitelisting, and nightly CSV batch drops.',
    targetGoLiveDate: '2026-12-20',
    apiSpec: {
      format: 'SOAP / XML',
      endpointsCount: 8,
      hasPagination: false,
      hasIdempotencyKeys: false,
      specSnippet: `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             targetNamespace="http://freightlink.internal/ws/tracking">
  <message name="GetWaybillStatusRequest">
    <part name="WaybillNumber" type="xsd:string"/>
  </message>
</definitions>`,
    },
    sampleData: {
      format: 'CSV',
      rawPayload: `WAYBILL_NUM,CONTAINER_ID,ORIGIN_PORT,DEST_HUB,DISPATCH_DATE,MANIFEST_STATUS,DRIVER_CELL
WB-90182,CONT-4091,PORT_NEWARK,CHI_HUB,10/05/26,IN_TRANSIT,555-019-2831
WB-90183,CONT-4092,PORT_OAKLAND,DEN_HUB,10/05/26,DELAYED_CUSTOMS,555-019-2832`,
      fieldsCount: 7,
      hasNestedArrays: false,
      hasTimestampMismatch: true, // Non-standard 2-digit year format
      hasCasingMismatch: true, // UPPERCASE_SNAKE
      hasPiiData: true, // Driver phone number
    },
    auth: {
      mechanism: 'basic_auth_deprecated',
      tokenLifetimeMinutes: 525600, // 1 year static credentials!
      rotationPolicy: 'Manual manual annual password change',
      clientCertRequired: false,
      ssoProvider: 'None (Hardcoded DB Credentials)',
    },
    rateLimits: {
      rpsLimit: 5,
      peakRps: 10,
      burstLimit: 12,
      quotaWindow: 'per second',
      enforcesConcurrencyCap: true,
      maxConcurrentRequests: 3,
      hasRetryAfterHeader: false,
    },
    networking: {
      type: 'ip_allowlisting',
      strictEgressFirewall: true,
      customDnsResolution: true,
      vpnRequired: true,
      allowedCidrs: ['198.51.100.22/32'],
    },
    webhook: {
      enabled: false,
      deliveryGuarantee: 'best_effort',
      retryBackoff: 'none',
      maxRetries: 0,
      hasHmacSignature: false,
      secretRotationSupported: false,
      timeoutSeconds: 30,
    },
    database: {
      engine: 'oracle_onprem',
      connectionPoolConfigured: false,
      maxConnections: 15,
      readReplicasAvailable: false,
      cdcEnabled: false,
      schemaMigrationAllowed: false,
    },
    deployment: {
      target: 'hybrid',
      region: 'us-west-2 / Customer Datacenter',
      computePlatform: 'Hybrid Kubernetes + On-prem Gateway Appliance',
      secretsManager: 'Local HashiCorp Vault / Static ConfigMap',
      useManagedWaf: false,
    },
    compliance: {
      soc2: false,
      hipaa: false,
      pciDss: false,
      gdpr: false,
      fedramp: false,
      dataResidencyCountry: 'US',
    },
    traffic: {
      averageRps: 2,
      peakRps: 8,
      avgPayloadKb: 120,
      trafficPattern: 'batch_nightly',
    },
    availability: {
      slaTarget: '99.9%',
      rtoHours: 12,
      rpoMinutes: 240,
      multiRegionActiveActive: false,
    },
    assumptions: [
      {
        id: 'asm-fl-1',
        statement: 'Customer AS400 middleware server will not lock up when queried at 5 concurrent requests.',
        confidence: 'Speculative',
        owner: 'FreightLink SysAdmin',
        validated: false,
        riskIfFalse: 'AS400 connection pool exhaustion crashes legacy dispatch terminal.',
      },
      {
        id: 'asm-fl-2',
        statement: 'Customer firewall admin can bind and whitelisting our static NAT Elastic IPs within 2 weeks.',
        confidence: 'Medium',
        owner: 'Infrastructure PM',
        validated: false,
        riskIfFalse: 'Total handshake timeout on all outbound traffic.',
      },
    ],
    discoveryNotes: `Discovery interview with Chief Logistics Officer and Lead AS400 programmer (Carl):
- API is an aging SOAP 1.1 service running on Windows Server 2012 with Basic Authentication.
- Hard ceiling of 5 RPS; anything higher causes DB2 lock contention.
- Nightly batch CSV is delivered via SFTP between 01:00 and 03:00 UTC.
- No automated regression testing environment exists; testing occurs directly against mirror staging instance with 4-day lag.`,
  },
];
