/**
 * Agent API Documentation Page
 * 
 * Human-readable docs for developers and AI agents
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Agent API Documentation | Datalyst',
    description: 'API documentation for AI agents to run N=1 scientific experiments',
};

export default function AgentApiDocsPage() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://datalyst.app';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Datalyst Agent API
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Run scientifically rigorous N=1 experiments for your users
                    </p>
                </div>

                {/* Quick Start */}
                <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        🚀 Quick Start
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">1. Get an API Key</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Contact <a href="mailto:support@datalyst.app" className="text-blue-600 hover:underline">support@datalyst.app</a> to obtain an API key.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">2. List Available Protocols</h3>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {`curl -H "X-API-Key: sk_your_key" \\
  ${baseUrl}/api/v1/protocols`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">3. Start a Trial</h3>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {`curl -X POST -H "X-API-Key: sk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"protocolId": "magnesium-sleep-v1"}' \\
  ${baseUrl}/api/v1/agent/trial`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">4. Log Daily Data</h3>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {`curl -X POST -H "X-API-Key: sk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "trialId": "cmlb87yie00073j9ok1fmjw8u",
    "date": "2025-01-15",
    "entries": [
      {"subvariableId": "cmlb87xic00043j9o9u7u6ij4", "value": true},
      {"subvariableId": "cmlb87xic00053j9okcpua2af", "value": 7.5}
    ]
  }' \\
  ${baseUrl}/api/v1/agent/log`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">5. Get Results</h3>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {`curl -H "X-API-Key: sk_your_key" \\
  ${baseUrl}/api/v1/agent/results/trial_abc123`}
                            </pre>
                        </div>
                    </div>
                </section>

                {/* cURL Examples */}
                <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        🧪 Example cURL Commands
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Invalid API key (401)</h3>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {`curl -i -X POST ${baseUrl}/api/v1/agent/trial \\
  -H "X-API-Key: sk_invalid" \\
  -H "Content-Type: application/json" \\
  -d '{"protocolId":"magnesium-sleep-v1"}'`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Validation error (400)</h3>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {`curl -i -X POST ${baseUrl}/api/v1/agent/log \\
  -H "X-API-Key: sk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"trialId":"trial_abc123","date":"2026/02/06","entries":[]}'`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Rate limit headers</h3>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {`curl -i -X POST ${baseUrl}/api/v1/agent/log \\
  -H "X-API-Key: sk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"trialId":"trial_abc123","date":"2026-02-06","entries":[{"subvariableId":"sv_x","value":1}]}'`}
                            </pre>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                Check <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, and <code>X-RateLimit-Reset</code> in the response headers.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Authentication */}
                <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        🔐 Authentication
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        All API requests require an <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">X-API-Key</code> header:
                    </p>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                        {`X-API-Key: sk_your_api_key_here`}
                    </pre>
                </section>

                {/* Endpoints */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                        📡 Endpoints
                    </h2>

                    <div className="space-y-6">
                        {/* GET /protocols */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
                                <code className="text-gray-900 dark:text-white font-mono">/api/v1/protocols</code>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                List all available experiment protocols. Use these to start trials.
                            </p>
                        </div>

                        {/* POST /agent/trial */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">POST</span>
                                <code className="text-gray-900 dark:text-white font-mono">/api/v1/agent/trial</code>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                Start a new trial from a protocol. Returns the trial ID and logging schema.
                            </p>
                            <div className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Body:</span>
                                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 text-xs">
                                    {`{ "protocolId": "magnesium-sleep-v1", "duration": 14 }`}
                                </pre>
                            </div>
                        </div>

                        {/* POST /agent/log */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">POST</span>
                                <code className="text-gray-900 dark:text-white font-mono">/api/v1/agent/log</code>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                Log data entries for a trial. Validates against the protocol schema.
                            </p>
                            <div className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Body:</span>
                                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 text-xs">
                                    {`{
  "trialId": "trial_abc123",
  "date": "2025-01-15",
  "entries": [
    { "subvariableId": "sv_xxx", "value": 7.5 }
  ]
}`}
                                </pre>
                            </div>
                        </div>

                        {/* GET /agent/results */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
                                <code className="text-gray-900 dark:text-white font-mono">/api/v1/agent/results/{'{trialId}'}</code>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                Get statistical results, rigor score, and blockchain verification for a trial.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Blockchain Verification */}
                <section className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        ⛓️ Blockchain Verification
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        All experiment results are attested on <strong>Base L2</strong> using the
                        <a href="https://attest.sh" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener">
                            Ethereum Attestation Service (EAS)
                        </a>.
                        Users don&apos;t need wallets—the platform signs on their behalf.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Schema UID:</strong><br />
                            <code className="text-xs break-all">0x121062e4b9590b821fddeec7affc8d5ed417c04ef7bc9f58e05be185f6e3b071</code>
                        </div>
                    </div>
                </section>

                {/* OpenAPI */}
                <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        📄 OpenAPI Specification
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        For AI agents and tooling, the full OpenAPI 3.0 spec is available at:
                    </p>
                    <a
                        href="/api/openapi.json"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                        <span>📋</span>
                        <code>/api/openapi.json</code>
                    </a>
                </section>

                {/* Rate Limits */}
                <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        ⏱️ Rate Limits
                    </h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="py-2 text-gray-700 dark:text-gray-200">Endpoint</th>
                                <th className="py-2 text-gray-700 dark:text-gray-200">Limit</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 dark:text-gray-300">
                            <tr className="border-b dark:border-gray-700">
                                <td className="py-2">All endpoints</td>
                                <td className="py-2">60 requests/minute</td>
                            </tr>
                            <tr>
                                <td className="py-2">POST /agent/log</td>
                                <td className="py-2">30 requests/minute</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        Some API keys may be provisioned with lower limits. Use response headers to monitor remaining quota.
                    </p>
                </section>

                {/* Footer */}
                <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <p>
                        Questions? Contact <a href="mailto:support@datalyst.app" className="text-blue-600 hover:underline">support@datalyst.app</a>
                    </p>
                </footer>
            </div>
        </div>
    );
}
