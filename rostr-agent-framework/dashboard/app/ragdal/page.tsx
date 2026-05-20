"use client"

import { Database, Search, Shield, Star, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function RAGDALPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    // Simulate multi-pass retrieval pipeline
    setTimeout(() => {
      setSearchResult({
        query: query,
        passes: [
          {
            pass: 1,
            confidence: 0.62,
            results: 8,
            topSources: [
              { tier: "academic", count: 3 },
              { tier: "editorial", count: 3 },
              { tier: "community", count: 2 }
            ]
          },
          {
            pass: 2,
            confidence: 0.74,
            results: 5,
            topSources: [
              { tier: "academic", count: 2 },
              { tier: "editorial", count: 2 },
              { tier: "community", count: 1 }
            ]
          },
          {
            pass: 3,
            confidence: 0.83,
            results: 3,
            topSources: [
              { tier: "academic", count: 2 },
              { tier: "editorial", count: 1 }
            ]
          },
        ],
        finalConfidence: 0.83,
        converged: true,
        knowledge: [
          {
            content: "Stripe Checkout supports multiple payment methods including cards, wallets (Apple Pay, Google Pay), and bank transfers. Session-based implementation recommended for security.",
            source: "https://stripe.com/docs/payments/checkout",
            tier: "academic",
            credibility: 1.0,
            confidence: 0.95
          },
          {
            content: "Best practice is to handle webhook events for payment.succeeded and subscription lifecycle changes. Implement idempotency keys to prevent duplicate processing.",
            source: "https://stripe.com/docs/webhooks/best-practices",
            tier: "academic",
            credibility: 1.0,
            confidence: 0.92
          },
          {
            content: "According to SaaS industry analysis, subscription billing should include prorated charges, grace periods for failed payments, and clear upgrade/downgrade paths.",
            source: "https://www.priceintelligently.com/blog/subscription-billing",
            tier: "editorial",
            credibility: 0.75,
            confidence: 0.78
          },
        ]
      })
      setIsSearching(false)
    }, 3000)
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "academic": return <Shield className="w-4 h-4 text-blue-500" />
      case "editorial": return <Star className="w-4 h-4 text-green-500" />
      case "community": return <Database className="w-4 h-4 text-orange-500" />
      default: return null
    }
  }

  const getTierBadge = (tier: string, credibility: number) => {
    const colors = {
      academic: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      editorial: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      community: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
    }
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${colors[tier as keyof typeof colors]}`}>
        {getTierIcon(tier)}
        {tier} ({credibility.toFixed(2)})
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RAG DAL Explorer</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Dynamic Acquisition Layer - Multi-pass retrieval with source tier credibility and confidence scoring
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            Submit Research Query
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            RAG DAL will perform multi-pass retrieval until confidence threshold (0.8) is reached or max passes (5) exceeded
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Research Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., How to implement Stripe subscription billing?"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Research
              </>
            )}
          </button>
        </form>

        {searchResult && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Query:</div>
              <div className="text-sm text-gray-900 dark:text-white">{searchResult.query}</div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Multi-Pass Retrieval:</h3>
              <div className="space-y-3">
                {searchResult.passes.map((pass: any) => (
                  <div key={pass.pass}>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Pass {pass.pass}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{pass.results} results</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Confidence:</span>
                            <span className={`text-xs font-medium ${pass.confidence >= 0.8 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                              {(pass.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {pass.topSources.map((source: any) => (
                          <div key={source.tier} className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                            {getTierIcon(source.tier)}
                            <span className="text-gray-700 dark:text-gray-300">{source.tier}: {source.count}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${pass.confidence >= 0.8 ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${pass.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {pass.pass < searchResult.passes.length && (
                      <div className="ml-4 my-2">
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                <span className="font-medium text-green-700 dark:text-green-300">
                  ✓ Convergence reached at {(searchResult.finalConfidence * 100).toFixed(0)}% confidence (threshold: 80%)
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Retrieved Knowledge:</h3>
              <div className="space-y-3">
                {searchResult.knowledge.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      {getTierBadge(item.tier, item.credibility)}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mb-2">{item.content}</p>
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {item.source}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Source Tier Credibility:</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Academic</span>
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300">Credibility: 1.0</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Editorial</span>
            </div>
            <span className="text-sm text-green-700 dark:text-green-300">Credibility: 0.75</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Community</span>
            </div>
            <span className="text-sm text-orange-700 dark:text-orange-300">Credibility: 0.40</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Example Queries:</h3>
        <div className="space-y-2">
          {[
            "How to implement Stripe subscription billing?",
            "Best practices for JWT authentication in Node.js",
            "Next.js 15 server components performance optimization",
            "PostgreSQL database indexing strategies for large tables"
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="w-full text-left px-4 py-3 text-sm bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
