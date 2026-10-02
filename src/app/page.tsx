'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import {
  Zap,
  Shield,
  Layers,
  Cpu,
  ArrowRight,
  Check,
  Copy,
  Terminal,
  Ticket,
  Sparkles,
  ExternalLink,
  Code2,
  Lock,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python');
  const [copied, setCopied] = useState(false);

  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'https://your-shop.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const codeSnippets = {
    python: `from openai import OpenAI

# Drop-in replacement for OpenAI SDK
client = OpenAI(
    base_url="${apiUrl}/v1",
    api_key="sk-gw-your-gateway-api-key"
)

response = client.chat.completions.create(
    model="astra",  # Automatically routes to 0.75x Flagship pool!
    messages=[
        {"role": "user", "content": "Write a high-performance LRU cache in Rust."}
    ],
    temperature=0.7,
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`,

    node: `import OpenAI from 'openai';

// Drop-in replacement for Node.js OpenAI SDK
const openai = new OpenAI({
  baseURL: '${apiUrl}/v1',
  apiKey: 'sk-gw-your-gateway-api-key'
});

const completion = await openai.chat.completions.create({
  model: 'sol', // Automatically routes to 0.50x Pro pool!
  messages: [{ role: 'user', content: 'Explain quantum computing in 3 sentences.' }]
});

console.log(completion.choices[0].message.content);`,

    curl: `curl ${apiUrl}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-gw-your-gateway-api-key" \\
  -d '{
    "model": "astra",
    "messages": [{"role": "user", "content": "Solve the traveling salesperson problem"}],
    "stream": false
  }'`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 selection:bg-primary-500/30 selection:text-primary-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-surfaceBorder">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">AI Gateway</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 border border-primary-500/30">
                v2.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Model Pricing</a>
            <a href="#quickstart" className="hover:text-white transition-colors">Quickstart</a>
            <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <span>Buy Tokens</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-500/25 transition-all flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-500/25 transition-all flex items-center gap-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-primary-500/30 text-xs font-medium text-primary-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span>OpenAI Intelligent Routing &bull; Rates as low as 0.21x</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            One API for OpenAI <br />
            <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Astra & Sol
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Route OpenAI Astra, Sol, and high-throughput reasoning models through a high-performance proxy with zero key leakage, CDK voucher redemption, and dynamic lowest-cost upstream routing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm shadow-xl shadow-primary-500/30 hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2"
            >
              <span>{user ? 'Open Dashboard' : 'Start Free Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface hover:bg-surfaceBorder border border-surfaceBorder text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>View Model Pricing</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Model Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider mr-1">Supported Models:</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface border border-surfaceBorder font-mono text-slate-300">Astra (0.75x)</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface border border-surfaceBorder font-mono text-slate-300">Sol (0.50x)</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface border border-surfaceBorder font-mono text-slate-300">Plus Pool (0.32x)</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface border border-surfaceBorder font-mono text-slate-300">Starter Pool (0.21x)</span>
          </div>
        </div>
      </section>

      {/* Quickstart Code Section */}
      <section id="quickstart" className="py-16 px-6 bg-surface/30 border-y border-surfaceBorder">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Code2 className="w-6 h-6 text-primary-400" />
              <span>100% OpenAI Drop-in Compatible</span>
            </h2>
            <p className="text-xs text-slate-400">
              Swap one line of code in your existing applications to start routing through our gateway.
            </p>
          </div>

          {/* Code Window */}
          <div className="bg-surface rounded-2xl border border-surfaceBorder overflow-hidden shadow-2xl">
            <div className="bg-background/80 px-4 py-3 border-b border-surfaceBorder flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="h-4 w-[1px] bg-surfaceBorder mx-1" />
                {/* Tabs */}
                {(['python', 'node', 'curl'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                      activeTab === tab
                        ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab === 'python' ? 'Python SDK' : tab === 'node' ? 'Node.js / TS' : 'cURL'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background hover:bg-surfaceBorder text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto bg-slate-950/70">
              <pre className="leading-relaxed whitespace-pre">
                {codeSnippets[activeTab]}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Built for Reliability & Cost Efficiency</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything your team needs to deploy generative AI applications with production guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder space-y-3 hover:border-primary-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Zero Upstream Leakage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-layer error sanitization prevents any upstream IP, endpoint, master key, or confidential user prompts from ever escaping in error traces.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder space-y-3 hover:border-primary-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Lowest Key Auto-Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically matches requests against upstream key pools and automatically routes each model to the channel with the lowest rate multiplier (down to 0.21x).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder space-y-3 hover:border-primary-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">CDK Voucher Redemption</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Self-service token top-up via activation codes with cryptographic entropy and atomic lock mechanisms to prevent race conditions or double-spending.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder space-y-3 hover:border-primary-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Prompt Caching Benefits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upstream prompt cache hits are recorded with zero token penalty, dramatically cutting latency and reducing your net token consumption.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder space-y-3 hover:border-primary-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Full Streaming & SSE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time Server-Sent Events stream passthrough with zero-buffering chunk forwarding and seamless token usage capture upon stream termination.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder space-y-3 hover:border-primary-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Optimistic Reservation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pre-allocates token budgets before contacting upstream, blocking concurrent free usage attacks and reconciling actual consumption cleanly.
            </p>
          </div>
        </div>
      </section>

      {/* Model Tier Preview Section */}
      <section id="pricing" className="py-16 px-6 bg-surface/30 border-t border-surfaceBorder">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Upstream Routing Tier Multipliers</h2>
              <p className="text-xs text-slate-400 mt-1">
                Requests are automatically routed to the cheapest channel supporting your requested model.
              </p>
            </div>
            <Link
              href="/dashboard/pricing"
              className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              <span>Full Model Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-surface border border-surfaceBorder space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Starter Pool</span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">0.21x</span>
              </div>
              <div className="text-xs text-slate-400">Promotional Quota Tier</div>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-surfaceBorder space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Plus Pool</span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400">0.32x</span>
              </div>
              <div className="text-xs text-slate-400">Plus Development Tier</div>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-surfaceBorder space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Pro Reasoning Pool</span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">0.50x</span>
              </div>
              <div className="text-xs text-slate-400">Sol Reasoning Model</div>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-surfaceBorder space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Flagship Pro Pool</span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400">0.75x</span>
              </div>
              <div className="text-xs text-slate-400">Astra Flagship Model</div>
            </div>
          </div>

          {/* Claude Coming Soon Notice */}
          <div className="mt-4 p-4 rounded-xl bg-surface/50 border border-dashed border-purple-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 text-[10px] font-bold uppercase tracking-wider">Coming Soon</span>
              <span className="text-xs text-slate-300">Anthropic Claude (Sonnet, Haiku, Opus) and additional AI providers</span>
            </div>
            <Link href="/dashboard" className="text-xs text-primary-400 hover:text-primary-300 font-medium">Dashboard &rarr;</Link>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">
          Upgrade Your AI API Infrastructure Today
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Sign up in seconds, redeem a CDK activation code, and connect your code with standard OpenAI SDKs.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm shadow-xl shadow-primary-500/30 transition-all flex items-center gap-2"
          >
            <span>{user ? 'Open Dashboard' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surfaceBorder py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} AI Gateway System. Multi-key routing & error-sanitizing reverse proxy.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/dashboard/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">Shop</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
