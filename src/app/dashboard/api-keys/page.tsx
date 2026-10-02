'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient, getApiBase } from '../../../lib/api-client';
import { formatDate } from '../../../lib/utils';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Code2,
  Terminal,
  FileCode
} from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [codeTab, setCodeTab] = useState<'python' | 'node' | 'curl'>('python');

  const fetchKeys = async () => {
    try {
      const res = await ApiClient.auth.getKeys();
      if (res.data?.keys) {
        setKeys(res.data.keys);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await ApiClient.auth.createKey(keyName || 'Default Key');
      if (res.data) {
        setNewlyCreatedKey(res.data.rawKey);
        setKeyName('');
        await fetchKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will immediately stop working.')) {
      return;
    }
    const res = await ApiClient.auth.revokeKey(id);
    if (res.data?.success) {
      await fetchKeys();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const [apiUrl, setApiUrl] = useState('https://jj-ai-gateway.onrender.com');

  useEffect(() => {
    setApiUrl(getApiBase());
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <KeyRound className="w-6 h-6 text-primary-400" />
            <span>API Keys</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage personal credentials used to authenticate your AI requests through this gateway.
          </p>
        </div>

        <button
          onClick={() => {
            setNewlyCreatedKey(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Secret Key</span>
        </button>
      </div>

      {/* Newly Created Key Alert Banner */}
      {newlyCreatedKey && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Save Your Secret Key</span>
          </div>
          <p className="text-xs text-slate-300">
            Please copy this key now. For your security, <strong className="text-white">you will not be able to see it again</strong> after navigating away.
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={newlyCreatedKey}
              className="w-full font-mono text-sm bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2 text-amber-300"
            />
            <button
              onClick={() => copyToClipboard(newlyCreatedKey)}
              className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
            >
              {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-surface rounded-2xl border border-surfaceBorder overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-surfaceBorder">
          <h2 className="text-sm font-semibold text-white">Active Secret Keys</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No API keys created yet. Click "Create New Secret Key" above to generate your first key.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surfaceBorder/30 text-slate-400 border-b border-surfaceBorder font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Key Name</th>
                  <th className="px-6 py-3">Key Identifier</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Last Used</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceBorder/60 text-slate-300">
                {keys.map(k => (
                  <tr key={k.id} className="hover:bg-surfaceHover/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{k.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{k.keyPrefix}</td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(k.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {k.lastUsedAt ? formatDate(k.lastUsedAt) : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        title="Revoke Key"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Integration Quick Start Guide */}
      <div className="bg-surface rounded-2xl border border-surfaceBorder p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-white">
          <Code2 className="w-5 h-5 text-primary-400" />
          <h2 className="text-base font-semibold">How to Integrate with SDKs</h2>
        </div>
        <p className="text-xs text-slate-400">
          Our gateway is 100% compatible with standard OpenAI SDKs. Simply point the <code className="text-primary-300">baseURL</code> to our gateway URL.
        </p>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-surfaceBorder pb-2">
          <button
            onClick={() => setCodeTab('python')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              codeTab === 'python' ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Python SDK</span>
          </button>
          <button
            onClick={() => setCodeTab('node')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              codeTab === 'node' ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Node.js SDK</span>
          </button>
          <button
            onClick={() => setCodeTab('curl')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              codeTab === 'curl' ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>cURL</span>
          </button>
        </div>

        {/* Code Snippet */}
        <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto border border-surfaceBorder/80">
          {codeTab === 'python' && (
            <pre>{`from openai import OpenAI

client = OpenAI(
    api_key="sk-gw-YOUR_API_KEY",
    base_url="${apiUrl}/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello world!"}]
)

print(response.choices[0].message.content)`}</pre>
          )}

          {codeTab === 'node' && (
            <pre>{`import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'sk-gw-YOUR_API_KEY',
  baseURL: '${apiUrl}/v1'
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello world!' }]
});

console.log(completion.choices[0].message.content);`}</pre>
          )}

          {codeTab === 'curl' && (
            <pre>{`curl ${apiUrl}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-gw-YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}</pre>
          )}
        </div>
      </div>

      {/* Modal for Creating Key */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-surfaceBorder rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create New Secret Key</h3>
            <p className="text-xs text-slate-400">
              Give your API key a descriptive name so you can identify its usage later.
            </p>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Key Name</label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={e => setKeyName(e.target.value)}
                  placeholder="e.g. Mobile App, Discord Bot, Production Server"
                  className="w-full bg-surfaceBorder/40 border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
                >
                  {creating ? 'Generating...' : 'Create Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
