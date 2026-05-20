"use client"

import { Database, Search, Star, Shield } from "lucide-react"
import { useState } from "react"

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNamespace, setSelectedNamespace] = useState("all")
  const [selectedTier, setSelectedTier] = useState("all")

  const knowledgeEntries = [
    {
      id: "1",
      content: "Stripe supports multiple subscription billing models including flat-rate, per-seat, and usage-based pricing. Webhooks are essential for handling subscription lifecycle events.",
      source: "https://stripe.com/docs/billing/subscriptions",
      tier: "academic",
      credibility: 1.0,
      namespace: "project",
      confidence: 0.95,
      tags: ["stripe", "billing", "subscriptions"],
      createdAt: "10 minutes ago"
    },
    {
      id: "2",
      content: "JWT authentication requires secure token storage (httpOnly cookies preferred), short expiration times (15-30min), and refresh token rotation to prevent token theft.",
      source: "https://auth0.com/docs/secure/tokens/json-web-tokens",
      tier: "academic",
      credibility: 1.0,
      namespace: "org",
      confidence: 0.92,
      tags: ["jwt", "authentication", "security"],
      createdAt: "25 minutes ago"
    },
    {
      id: "3",
      content: "Next.js 15 introduces improved caching strategies with granular revalidation controls. Server Components should be the default for data fetching unless client interactivity is required.",
      source: "https://nextjs.org/blog/next-15",
      tier: "academic",
      credibility: 1.0,
      namespace: "team",
      confidence: 0.98,
      tags: ["nextjs", "react", "performance"],
      createdAt: "1 hour ago"
    },
    {
      id: "4",
      content: "Based on competitor analysis, SaaS pricing pages typically show 3-4 tiers with annual discount (15-20%), feature comparison table, and prominent CTA buttons.",
      source: "https://www.priceintelligently.com/blog/saas-pricing-page-design",
      tier: "editorial",
      credibility: 0.75,
      namespace: "project",
      confidence: 0.88,
      tags: ["pricing", "design", "saas"],
      createdAt: "2 hours ago"
    },
    {
      id: "5",
      content: "Reddit discussion suggests developers prefer Tailwind for rapid prototyping but note the importance of consistent design tokens and avoiding utility class bloat.",
      source: "https://reddit.com/r/webdev/comments/abc123",
      tier: "community",
      credibility: 0.40,
      namespace: "global",
      confidence: 0.65,
      tags: ["tailwind", "css", "design"],
      createdAt: "3 hours ago"
    },
  ]

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "academic":
        return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
          <Shield className="w-3 h-3" /> Academic (1.0)
        </span>
      case "editorial":
        return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
          <Star className="w-3 h-3" /> Editorial (0.75)
        </span>
      case "community":
        return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded">
          <Database className="w-3 h-3" /> Community (0.40)
        </span>
      default:
        return null
    }
  }

  const filteredEntries = knowledgeEntries.filter(entry => {
    const matchesSearch = searchQuery === "" ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesNamespace = selectedNamespace === "all" || entry.namespace === selectedNamespace
    const matchesTier = selectedTier === "all" || entry.tier === selectedTier
    return matchesSearch && matchesNamespace && matchesTier
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          RAG DAL - Dynamic knowledge acquisition with multi-tier source credibility and confidence scoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Entries</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{knowledgeEntries.length}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500 dark:text-gray-400">Academic</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            {knowledgeEntries.filter(e => e.tier === 'academic').length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-500 dark:text-gray-400">Editorial</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            {knowledgeEntries.filter(e => e.tier === 'editorial').length}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="text-sm text-gray-500 dark:text-gray-400">Community</div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
            {knowledgeEntries.filter(e => e.tier === 'community').length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Namespaces</option>
            <option value="project">Project</option>
            <option value="org">Organization</option>
            <option value="team">Team</option>
            <option value="global">Global</option>
          </select>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tiers</option>
            <option value="academic">Academic</option>
            <option value="editorial">Editorial</option>
            <option value="community">Community</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTierBadge(entry.tier)}
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                    {entry.namespace}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Confidence: {(entry.confidence * 100).toFixed(0)}%</span>
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${entry.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-900 dark:text-white mb-3">
                {entry.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <a href={entry.source} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                    View source →
                  </a>
                  <span>{entry.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No knowledge entries found matching your filters
          </div>
        )}
      </div>
    </div>
  )
}
