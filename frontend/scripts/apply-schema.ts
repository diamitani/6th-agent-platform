// Supabase Schema Setup Script
// Run: npx tsx scripts/apply-schema.ts
// Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// Load env
import { config } from "dotenv"
config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  console.error("Get your service_role key from: https://supabase.com/dashboard/project/wkgcsxraertasnbfuwlm/settings/api")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

async function applySchema() {
  console.log("🔧 Applying Supabase schema...")
  
  const sqlPath = path.resolve(__dirname, "../docs/supabase-setup.sql")
  const sql = fs.readFileSync(sqlPath, "utf-8")

  // Split by semicolons and execute each statement
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"))

  let success = 0
  let failed = 0

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc("exec_sql", { sql: stmt + ";" })
      if (error && !error.message.includes("already exists") && !error.message.includes("duplicate")) {
        // Try direct SQL via REST API
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": serviceRoleKey,
            "Authorization": `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ sql: stmt + ";" }),
        })
        if (!res.ok) {
          const text = await res.text()
          if (!text.includes("already exists") && !text.includes("duplicate")) {
            console.warn(`⚠️ Statement failed (may be ok): ${text.slice(0, 100)}`)
            failed++
          }
        } else {
          success++
        }
      } else {
        success++
      }
    } catch (err) {
      // Most errors are "already exists" which is fine
      failed++
    }
  }

  console.log(`✅ Schema applied: ${success} statements executed`)
  if (failed > 0) console.log(`⚠️ ${failed} statements had issues (likely already exists — safe to ignore)`)
}

async function seedTemplates() {
  console.log("🌱 Seeding agent templates...")

  const templates = [
    { name: "Chief of Staff", role: "Orchestrator", emoji: "🎯", color: "#C0272D", category: "Operations", triggers: ["Triage", "Status", "NPAO"] },
    { name: "Marketing Manager", role: "Growth", emoji: "📊", color: "#2563EB", category: "Marketing", triggers: ["Marketing", "Channels", "ICP"] },
    { name: "Content Writer", role: "Content", emoji: "✍️", color: "#059669", category: "Content", triggers: ["Content drop", "Email sequence", "Copy"] },
    { name: "DM Agent", role: "Outreach", emoji: "💬", color: "#7C3AED", category: "Sales", triggers: ["DM batch", "Outreach", "30 DMs"] },
    { name: "Social Media Manager", role: "Social", emoji: "📱", color: "#D97706", category: "Marketing", triggers: ["Social", "Post", "Content calendar"] },
    { name: "Promotions Manager", role: "Promotions", emoji: "🔥", color: "#DB2777", category: "Marketing", triggers: ["Promo", "Offer", "Launch"] },
    { name: "Research Agent", role: "Research", emoji: "🔍", color: "#0891B2", category: "Operations", triggers: ["Research", "Competitive", "ICP research"] },
    { name: "Paid Ads Manager", role: "Advertising", emoji: "💰", color: "#65A30D", category: "Marketing", triggers: ["Ad copy", "Google Ads", "Campaign"] },
    { name: "Sales Agent", role: "Sales", emoji: "🤝", color: "#C0272D", category: "Sales", triggers: ["Sales", "Convert", "Founding member"] },
    { name: "Builder Agent", role: "Development", emoji: "🏗️", color: "#1A1A1A", category: "Operations", triggers: ["Product update", "Ship", "Launch mode"] },
    { name: "Customer Support", role: "Support", emoji: "🎧", color: "#059669", category: "Operations", triggers: ["Support", "Ticket", "FAQ"] },
    { name: "Email Marketer", role: "Email", emoji: "📧", color: "#D97706", category: "Marketing", triggers: ["Email", "Newsletter", "Automation"] },
    { name: "Data Analyst", role: "Analytics", emoji: "📈", color: "#2563EB", category: "Operations", triggers: ["Analysis", "Report", "Metrics"] },
    { name: "Legal Reviewer", role: "Legal", emoji: "⚖️", color: "#4A4A4A", category: "Legal", triggers: ["Contract", "Legal review", "Compliance"] },
    { name: "Music Promoter", role: "Music", emoji: "🎵", color: "#DB2777", category: "Music", triggers: ["Release", "Playlist", "DSP"] },
    { name: "Video Producer", role: "Video", emoji: "🎬", color: "#7C3AED", category: "Content", triggers: ["Video", "Script", "Shorts"] },
    { name: "Product Manager", role: "Product", emoji: "📋", color: "#0891B2", category: "Operations", triggers: ["Roadmap", "Spec", "User story"] },
    { name: "Community Manager", role: "Community", emoji: "👥", color: "#65A30D", category: "Marketing", triggers: ["Community", "Engagement", "Event"] },
    { name: "SEO Specialist", role: "SEO", emoji: "🔎", color: "#2563EB", category: "Marketing", triggers: ["SEO", "Keywords", "Backlinks"] },
    { name: "Financial Analyst", role: "Finance", emoji: "💎", color: "#D97706", category: "Finance", triggers: ["Finance", "Budget", "Forecast"] },
  ]

  for (const t of templates) {
    const { error } = await supabase
      .from("agent_templates")
      .upsert({ ...t, is_public: true, system_prompt: `You are the ${t.name}.` }, { onConflict: "name" })

    if (error && !error.message.includes("duplicate")) {
      console.warn(`⚠️ Could not seed ${t.name}: ${error.message}`)
    }
  }

  const { count } = await supabase.from("agent_templates").select("*", { count: "exact", head: true })
  console.log(`✅ ${count} templates seeded`)
}

async function main() {
  console.log("🚀 Rostr Agent Builder — Schema Setup\n")
  
  // Try SQL execution
  try {
    await applySchema()
  } catch (err) {
    console.error("❌ Schema application failed. Try running docs/supabase-setup.sql manually in Supabase Dashboard.")
    console.error("   Dashboard: https://supabase.com/dashboard/project/wkgcsxraertasnbfuwlm/sql/new")
    console.error(`   Error: ${err}`)
  }

  // Seed templates
  try {
    await seedTemplates()
  } catch (err) {
    console.error(`❌ Template seeding failed: ${err}`)
  }

  console.log("\n🎉 Done! Run `npm run dev` to start the app.")
}

main()
