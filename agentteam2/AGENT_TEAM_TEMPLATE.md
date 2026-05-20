# AGENT_TEAM.md — Product Agent Team Template

> Copy this file for every new product. Fill in the blanks. Deploy immediately.
> This is your product's agent org chart.

---

## Product: [PRODUCT NAME]

**Revenue Tier:** [ ] Volume $10  [ ] Core $100  [ ] Pro $1K  [ ] Agency $10K  
**Target ARR:** $1,000,000  
**Launch Date:** _______________  
**Current MRR:** $0 → Target MRR: $_______________

---

## PAL Compile (fill this out first)

```
PARSE:    The user (________________) struggles with ________________.
ABSTRACT: The simplest MVP is ________________ that does ________________.
LAYER:    v1 = [1. ___ 2. ___ 3. ___]
          v1.1 = [everything else — park it here]
```

---

## NPAO Launch Canvas

```
NECESSITY (nothing proceeds without these):
  [ ] Payment processing live (Stripe)
  [ ] Landing page live with working CTA
  [ ] Core feature functional end-to-end
  [ ] Auth (sign up / login) working
  [ ] _________________________________

ANXIETY (clear before marketing starts):
  [ ] No broken links on landing page
  [ ] No console errors in core flow
  [ ] No unanswered support messages
  [ ] _________________________________

PRIORITY (mission-critical growth actions):
  [ ] 10 personal outreach messages sent
  [ ] Launch post drafted and approved
  [ ] DM sequence active (20/day)
  [ ] First 3 paying users acquired
  [ ] _________________________________

OPPORTUNITY (growth compounders — when bandwidth allows):
  [ ] SEO content plan started
  [ ] Referral program live
  [ ] Partnership outreach begun
  [ ] _________________________________
```

---

## Active Agent Team

### 🧠 Chief of Staff
**Reading:** `agents/chief-of-staff.md`  
**Assigned to:** All orchestration, weekly status reports, NPAO triage  
**Trigger:** "Status update" / "What should we work on?" / "Triage this week"

---

### 📣 Marketing Manager
**Reading:** `agents/marketing-manager.md`  
**ICP for this product:** _______________  
**Primary channels:** _______________  
**Monthly content volume:** _____ posts/week LinkedIn, _____ posts/day IG, _____ DMs/day  
**Trigger:** "Build a GTM plan" / "Plan the launch" / "What's our channel strategy?"

---

### ✍️ Content Writer
**Reading:** `agents/content-writer.md`  
**Active deliverables:**
- [ ] Landing page copy
- [ ] Onboarding email sequence (5 emails)
- [ ] 2x blog posts/week
- [ ] _________________________________

**Tone for this product:** _______________  
**Trigger:** "Write copy for" / "Draft the email" / "Landing page"

---

### 💬 DM Agent
**Reading:** `agents/dm-agent.md`  
**Platform priority:** [ ] LinkedIn  [ ] Instagram  [ ] Twitter/X  
**Daily volume:** _____ DMs/day  
**ICP hook:** _______________  
**Approval required:** ✅ Yes — Pat approves all batches before sending  
**Trigger:** "Write DMs" / "Draft outreach" / "Build DM sequence"

---

### 📱 Social Media Agent
**Reading:** `agents/social-media.md`  
**Posting schedule:**  
  - LinkedIn: ___x/week  
  - Instagram: Daily  
  - Twitter/X: ___x/day  
**Content pillars for this product:** _______________  
**Trigger:** "Write a post" / "Plan this week's content" / "Draft the announcement"

---

### 🎁 Promotions Agent
**Reading:** `agents/promotions.md`  
**Active offer:** _______________  
**Promo calendar:**
  - Launch promo: _______________
  - Referral: [ ] Live  [ ] Planned
  - Retention: Triggered at 30 days inactive  
**Trigger:** "Build a promo" / "Design the offer" / "Launch deal"

---

### 🔬 Research Agent
**Reading:** `agents/researcher.md`  
**Knowledge base:** `/hub/projects/[product]/knowledge-base/`  
**Completed research:**
  - [ ] Competitive intel
  - [ ] ICP research
  - [ ] Pricing landscape
  - [ ] Watering holes  
**Trigger:** "Research" / "Who are the competitors?" / "What does the ICP look like?"

---

### 🏗️ Builder Agent
**Reading:** `agents/builder.md` (see product-builder SKILL.md)  
**Tech stack:** Next.js 15 + Supabase + Claude API + Vercel  
**Active sprint:** _______________  
**Trigger:** "Build" / "Fix" / "Code" / "Deploy"

---

## Weekly Rhythm

```
MONDAY — NPAO Triage (Chief of Staff)
  [ ] Run NPAO canvas for the week
  [ ] Assign agent tasks
  [ ] Brief Marketing Manager on priorities

TUESDAY — CONTENT DAY
  [ ] Content Writer: 2 posts drafted
  [ ] DM Agent: Week's outreach batch drafted
  [ ] Chief of Staff: Review + send to Pat for approval

WEDNESDAY — BUILD DAY
  [ ] Builder Agent: Sprint work
  [ ] Research Agent: Any new intel needed

THURSDAY — SOCIAL DAY
  [ ] Social posts go live (LinkedIn + IG)
  [ ] DMs approved and queued

FRIDAY — REVIEW DAY
  [ ] Chief of Staff: Weekly status report
  [ ] ARR tracker updated
  [ ] Next week NPAO canvas started
```

---

## ARR Tracking

```
Week 1:   MRR = $_______ | Users = ___
Week 2:   MRR = $_______ | Users = ___
Week 4:   MRR = $_______ | Users = ___
Month 2:  MRR = $_______ | Users = ___
Month 3:  MRR = $_______ | Users = ___
Month 6:  MRR = $_______ | Users = ___
Month 12: MRR = $_______ | ARR = $_______
```

---

## How to Activate This Team

**When starting a new session:**

1. Open this file
2. Tell Claude: *"We're working on [Product]. Read SOUL.md, CLAUDE.md, and this AGENT_TEAM.md. You're acting as [Chief of Staff / specific agent]. Here's what we need to do today: ___"*
3. Run NPAO triage
4. Execute

**Shortcut commands:**
- "Status" → Chief of Staff runs weekly report
- "Triage" → NPAO canvas for current project
- "Content drop" → Social + DM + email content for the week
- "Launch mode" → Full launch sequence activated
- "Research [topic]" → Research Agent RAG DAL run

---

*Read SOUL.md first. Always.*  
*This file lives at: `/hub/projects/[product]/AGENT_TEAM.md`*
