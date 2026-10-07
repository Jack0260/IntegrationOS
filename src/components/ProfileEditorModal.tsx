import React, { useState } from 'react';
import { CustomerProfile, AuthMechanism, NetworkingType, DeploymentTarget, DatabaseEngine } from '../types/integration';
import { X, Save, Sliders, FileCode, Shield, Network, Server } from 'lucide-react';

interface ProfileEditorModalProps {
  profile: CustomerProfile;
  onSave: (updated: CustomerProfile) => void;
  onClose: () => void;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  profile,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<CustomerProfile>({ ...profile });
  const [editorTab, setEditorTab] = useState<'general' | 'api' | 'auth' | 'networking' | 'database' | 'compliance'>('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">
              Configure Customer Environment Profile
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 p-2 bg-zinc-900 border-b border-zinc-800 text-xs">
          {(['general', 'api', 'auth', 'networking', 'database', 'compliance'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setEditorTab(tab)}
              className={`px-3 py-1.5 rounded font-medium capitalize transition-colors ${
                editorTab === tab ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-zinc-300">
          {/* General Tab */}
          {editorTab === 'general' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Customer / Project Name:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Industry Vertical:</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Customer Tier:</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Enterprise Tier-1">Enterprise Tier-1</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="Growth">Growth</option>
                    <option value="Regulated / Gov">Regulated / Gov</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Target Go-Live Date:</label>
                  <input
                    type="date"
                    value={formData.targetGoLiveDate}
                    onChange={(e) => setFormData({ ...formData, targetGoLiveDate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Deployment Target Cloud:</label>
                <select
                  value={formData.deployment.target}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deployment: { ...formData.deployment, target: e.target.value as DeploymentTarget },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="aws">AWS (Amazon Web Services)</option>
                  <option value="azure">Microsoft Azure</option>
                  <option value="gcp">Google Cloud Platform (GCP)</option>
                  <option value="kubernetes_onprem">Kubernetes (On-Premises)</option>
                  <option value="hybrid">Hybrid Cloud / Multi-Datacenter</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Environment Overview Summary:</label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* API Tab */}
          {editorTab === 'api' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">API Specification Format:</label>
                  <select
                    value={formData.apiSpec.format}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        apiSpec: { ...formData.apiSpec, format: e.target.value as any },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                  >
                    <option value="OpenAPI 3.1">OpenAPI 3.1</option>
                    <option value="GraphQL">GraphQL</option>
                    <option value="gRPC">gRPC</option>
                    <option value="Custom REST">Custom REST</option>
                    <option value="SOAP / XML">SOAP / XML</option>
                    <option value="Batch CSV / SFTP">Batch CSV / SFTP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Number of Endpoints:</label>
                  <input
                    type="number"
                    value={formData.apiSpec.endpointsCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        apiSpec: { ...formData.apiSpec, endpointsCount: parseInt(e.target.value) || 1 },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.apiSpec.hasPagination}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        apiSpec: { ...formData.apiSpec, hasPagination: e.target.checked },
                      })
                    }
                    className="rounded bg-zinc-950 border-zinc-700 text-emerald-500"
                  />
                  <span>Has Pagination Enabled</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.apiSpec.hasIdempotencyKeys}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        apiSpec: { ...formData.apiSpec, hasIdempotencyKeys: e.target.checked },
                      })
                    }
                    className="rounded bg-zinc-950 border-zinc-700 text-emerald-500"
                  />
                  <span>Native Idempotency Keys</span>
                </label>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Sample Raw JSON / CSV Payload:</label>
                <textarea
                  rows={4}
                  value={formData.sampleData.rawPayload}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sampleData: { ...formData.sampleData, rawPayload: e.target.value },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <label className="flex items-center gap-1.5 p-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.sampleData.hasTimestampMismatch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sampleData: { ...formData.sampleData, hasTimestampMismatch: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>Timestamp Mismatch</span>
                </label>
                <label className="flex items-center gap-1.5 p-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.sampleData.hasCasingMismatch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sampleData: { ...formData.sampleData, hasCasingMismatch: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>Casing Mismatch</span>
                </label>
                <label className="flex items-center gap-1.5 p-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.sampleData.hasPiiData}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sampleData: { ...formData.sampleData, hasPiiData: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>Contains PII / PHI</span>
                </label>
              </div>
            </div>
          )}

          {/* Auth Tab */}
          {editorTab === 'auth' && (
            <div className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Authentication Mechanism:</label>
                <select
                  value={formData.auth.mechanism}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      auth: { ...formData.auth, mechanism: e.target.value as AuthMechanism },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                >
                  <option value="oauth2_client_credentials">OAuth 2.0 Client Credentials</option>
                  <option value="mtls">Mutual TLS (mTLS) with Client Certs</option>
                  <option value="saml_oidc_sso">SAML 2.0 / OIDC Federated SSO</option>
                  <option value="api_keys">Static API Keys (Header Bearer)</option>
                  <option value="hmac_signed">HMAC SHA-256 Signed Requests</option>
                  <option value="aws_sigv4">AWS IAM SigV4 Signed</option>
                  <option value="basic_auth_deprecated">Basic Auth (Legacy Deprecated)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Token Lifetime (Minutes):</label>
                  <input
                    type="number"
                    value={formData.auth.tokenLifetimeMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        auth: { ...formData.auth, tokenLifetimeMinutes: parseInt(e.target.value) || 15 },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Rotation Policy:</label>
                  <input
                    type="text"
                    value={formData.auth.rotationPolicy}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        auth: { ...formData.auth, rotationPolicy: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                  />
                </div>
              </div>

              {/* Webhook sub-config */}
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 space-y-2 mt-2">
                <div className="font-semibold text-zinc-200">Webhook Callbacks</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.webhook.enabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          webhook: { ...formData.webhook, enabled: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-500"
                    />
                    <span>Webhooks Enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.webhook.hasHmacSignature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          webhook: { ...formData.webhook, hasHmacSignature: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-500"
                    />
                    <span>HMAC-SHA256 Signed</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Networking Tab */}
          {editorTab === 'networking' && (
            <div className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Network Transport Type:</label>
                <select
                  value={formData.networking.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      networking: { ...formData.networking, type: e.target.value as NetworkingType },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                >
                  <option value="cloud_privatelink">AWS PrivateLink / Azure Private Endpoint / GCP PSC</option>
                  <option value="vpc_peering">VPC Peering Tunnel</option>
                  <option value="ip_allowlisting">Static IP Allowlisting (NAT Gateway)</option>
                  <option value="forward_egress_proxy">Forward Egress Proxy with TLS Inspection</option>
                  <option value="public_internet">Public Internet HTTPS</option>
                  <option value="airgapped_dmz">Airgapped DMZ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.networking.strictEgressFirewall}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        networking: { ...formData.networking, strictEgressFirewall: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>Strict Egress Firewall</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.networking.customDnsResolution}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        networking: { ...formData.networking, customDnsResolution: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>Custom Split DNS Zone</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">RPS Quota Limit:</label>
                  <input
                    type="number"
                    value={formData.rateLimits.rpsLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rateLimits: { ...formData.rateLimits, rpsLimit: parseInt(e.target.value) || 10 },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Burst RPS Limit:</label>
                  <input
                    type="number"
                    value={formData.rateLimits.burstLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rateLimits: { ...formData.rateLimits, burstLimit: parseInt(e.target.value) || 20 },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {editorTab === 'database' && (
            <div className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Database Engine:</label>
                <select
                  value={formData.database.engine}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      database: { ...formData.database, engine: e.target.value as DatabaseEngine },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                >
                  <option value="aurora_postgres">AWS Aurora PostgreSQL</option>
                  <option value="postgresql">PostgreSQL Standard</option>
                  <option value="dynamodb">Amazon DynamoDB</option>
                  <option value="bigquery">Google BigQuery</option>
                  <option value="snowflake">Snowflake</option>
                  <option value="oracle_onprem">Oracle On-Premise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.database.connectionPoolConfigured}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        database: { ...formData.database, connectionPoolConfigured: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>Connection Pooling (PgBouncer)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.database.schemaMigrationAllowed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        database: { ...formData.database, schemaMigrationAllowed: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>Schema Migrations Allowed</span>
                </label>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {editorTab === 'compliance' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.compliance.soc2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compliance: { ...formData.compliance, soc2: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>SOC 2 Type II</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.compliance.hipaa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compliance: { ...formData.compliance, hipaa: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>HIPAA (Healthcare BAA)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.compliance.pciDss}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compliance: { ...formData.compliance, pciDss: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>PCI-DSS Level 1</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.compliance.gdpr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compliance: { ...formData.compliance, gdpr: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span>GDPR (EU Data Residency)</span>
                </label>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Data Residency Country:</label>
                <input
                  type="text"
                  value={formData.compliance.dataResidencyCountry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      compliance: { ...formData.compliance, dataResidencyCountry: e.target.value },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                />
              </div>
            </div>
          )}

          {/* Footer Save */}
          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Spec & Recalculate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
