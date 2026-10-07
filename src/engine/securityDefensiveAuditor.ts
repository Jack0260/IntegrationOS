import { CustomerProfile, DefensiveSecurityCheck } from '../types/integration';

export function runDefensiveSecurityAudit(profile: CustomerProfile): DefensiveSecurityCheck[] {
  const checks: DefensiveSecurityCheck[] = [];

  // Check 1: Weak Authentication
  const isWeakAuth = profile.auth.mechanism === 'basic_auth_deprecated' || profile.auth.tokenLifetimeMinutes > 1440;
  checks.push({
    id: 'sec-auth-weak',
    title: 'Authentication Hygiene & Token Lifespan',
    category: 'Weak Auth',
    severity: profile.auth.mechanism === 'basic_auth_deprecated' ? 'CRITICAL' : 'HIGH',
    detected: isWeakAuth,
    explanation: profile.auth.mechanism === 'basic_auth_deprecated'
      ? 'Static Basic Authentication detected. Credentials are sent in plain Base64 headers with every request and cannot be scoped or quickly revoked.'
      : isWeakAuth
      ? `Token lifetime is excessively long (${Math.round(profile.auth.tokenLifetimeMinutes / 60)} hours). Ephemeral token exposure window exceeds enterprise threshold.`
      : 'Modern scoped token authentication (OAuth2 / mTLS) with sub-hour lifetime.',
    remediationRecipe: 'Transition immediately to OAuth2.0 Client Credentials with JWTs signed via RS256/ES256 and maximum TTL of 60 minutes.',
    cliVerificationCommand: `curl -s -I -H "Authorization: Basic dXNlcjpwYXNz" https://api.integration.internal/v1/health | grep -i "401"`,
  });

  // Check 2: Missing TLS Assumptions & Termination
  const isMissingTlsAssumptions = profile.networking.type === 'public_internet' && profile.auth.mechanism !== 'mtls';
  checks.push({
    id: 'sec-tls-transport',
    title: 'Transport Layer Security & Cipher Enforceability',
    category: 'Missing TLS',
    severity: isMissingTlsAssumptions ? 'HIGH' : 'LOW',
    detected: isMissingTlsAssumptions,
    explanation: isMissingTlsAssumptions
      ? 'Public internet traversal detected without mutual TLS enforcement. Vulnerable to misconfigured edge proxies terminating TLS to cleartext upstream.'
      : 'Strict private networking (PrivateLink / VPN) or mutual TLS enforced across boundary.',
    remediationRecipe: 'Enforce TLS 1.3 minimum in CloudFront / API Gateway / Cloud Armor policies. Disable legacy CBC ciphers and enforce Strict-Transport-Security (HSTS).',
    cliVerificationCommand: `openssl s_client -connect api.integration.internal:443 -tls1_2 -servername api.integration.internal </dev/null | grep -i "Cipher"`,
  });

  // Check 3: Excessive Permissions & Overprivileging
  const isExcessivePerms = profile.networking.allowedCidrs.includes('0.0.0.0/0') && profile.sampleData.hasPiiData;
  checks.push({
    id: 'sec-excessive-perms',
    title: 'Network Ingress Scoping & Sensitive Data Boundary',
    category: 'Excessive Permissions',
    severity: isExcessivePerms ? 'CRITICAL' : 'MEDIUM',
    detected: isExcessivePerms,
    explanation: isExcessivePerms
      ? 'Ingress CIDR is wide open (0.0.0.0/0) while transmitting unmasked sensitive PII/PHI. Any IP on the internet can attempt brute-force probes against authentication endpoints.'
      : 'Ingress traffic is restricted to known CIDR ranges or routed via isolated private cloud endpoints.',
    remediationRecipe: 'Lock ingress security groups to customer explicit NAT gateway CIDRs or transition ingress to AWS PrivateLink / GCP PSC.',
    cliVerificationCommand: `aws ec2 describe-security-groups --filters "Name=ip-permission.cidr,Values='0.0.0.0/0'" --query "SecurityGroups[*].GroupId"`,
  });

  // Check 4: Sensitive Data Exposure (PII in Payload)
  const isPiiExposed = profile.sampleData.hasPiiData && !profile.compliance.hipaa && !profile.compliance.soc2;
  checks.push({
    id: 'sec-pii-exposure',
    title: 'Sensitive Data Exposure & Field Redaction',
    category: 'Sensitive Data Exposure',
    severity: profile.sampleData.hasPiiData ? 'HIGH' : 'LOW',
    detected: profile.sampleData.hasPiiData,
    explanation: profile.sampleData.hasPiiData
      ? 'Sample payload contains unencrypted identifiers (Tax ID / SSN / Medical Record Numbers / Account PANs). High risk of inadvertent logging in Datadog / CloudWatch.'
      : 'No high-risk PII identifiers detected in baseline ingestion schemas.',
    remediationRecipe: 'Apply deterministic field masking (e.g. last 4 digits only) and tokenize identifiers via KMS Customer-Managed Key prior to writing to queues or databases.',
    cliVerificationCommand: `grep -rEi "(ssn|tax_id|mrn|account_num)" src/ | grep -v "mask"`,
  });

  // Check 5: Unsafe Configuration (Unauthenticated Webhooks & Replay Vulnerability)
  const isUnsafeConfig = (profile.webhook.enabled && !profile.webhook.hasHmacSignature) || !profile.apiSpec.hasIdempotencyKeys;
  checks.push({
    id: 'sec-unsafe-config',
    title: 'Webhook Cryptographic Signature & Replay Defense',
    category: 'Unsafe Configuration',
    severity: profile.webhook.enabled && !profile.webhook.hasHmacSignature ? 'CRITICAL' : 'HIGH',
    detected: isUnsafeConfig,
    explanation: profile.webhook.enabled && !profile.webhook.hasHmacSignature
      ? 'CRITICAL DEFECT: Outbound/Inbound webhooks have NO HMAC signature. Any adversary can forge webhook callbacks to trigger fraudulent internal workflows.'
      : !profile.apiSpec.hasIdempotencyKeys
      ? 'No idempotency keys supported on write APIs. Network retries will duplicate payments or state mutations.'
      : 'Webhook HMAC signatures and API idempotency headers active.',
    remediationRecipe: 'Add an HMAC-SHA256 signature in X-Signature header using a shared high-entropy secret, and verify signature timing-safe in API Gateway middleware.',
    cliVerificationCommand: `curl -X POST https://api.integration.internal/webhooks -H "X-Signature: invalid" -d '{"event":"test"}' -i | grep -i "401\\|403"`,
  });

  return checks;
}
