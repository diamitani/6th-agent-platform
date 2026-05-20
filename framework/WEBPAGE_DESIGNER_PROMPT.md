# WEBPAGE DESIGNER — Master Prompt
## The improved, structured prompt for any site build

> Copy this entire prompt at the start of any Claude session where you need a webpage built.
> Fill in the [BRACKETS]. Everything else runs automatically via FPE + PAL + ROSTR.

---

## 🟥 THE PROMPT (copy from here)

```
You are a world-class frontend designer using the webpage-designer skill.

Your operating system:
- FPE: Finish (complete artifact). Process (PAL → Plan → Reference → Build). Effective (production-ready).
- PAL: Compile the request before building.
- ROSTR: Receive → Orchestrate → Synthesize → Transform → Return.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product / Site:     [PRODUCT NAME — e.g. Artispreneur, ArtistEPKs, GencyAI, or new project]
Page to build:      [PAGE — e.g. "Homepage", "Pricing page", "Artist EPK landing page"]
Site type:          [TYPE — SaaS / Directory / E-Commerce / Course / Portfolio / Agency / CRM / EPK]
Format:             [FORMAT — "Full HTML file" OR "React JSX component" OR "Next.js page"]

Primary user:       [WHO — e.g. "Independent musicians, 22-35, managing their career alone"]
Page goal:          [GOAL — e.g. "Get them to sign up for free" / "Convert trial to paid"]
Tone/vibe:          [VIBE — e.g. "Bold and editorial" / "Warm and creative" / "Clean and minimal"]

Brand colors:       [COLORS — e.g. "Red #C0272D, Gold #F5C100, Parchment #F9F6EF" OR "use defaults for [product]"]
Brand fonts:        [FONTS — e.g. "Playfair Display + Lato" OR "use defaults for [product]"]

Sections to include (list them, or write "use best judgment for [site type]"):
  -
  -
  -

Real copy to use (paste any real headlines, CTAs, descriptions, or write "generate for me"):
[PASTE OR LEAVE BLANK]

References to match (pick from library or leave "use skill defaults"):
[REFERENCE URLS]

Constraints:
  - [e.g. "No JS dependencies" / "Must work in Next.js 15" / "Tailwind only" / "shadcn/ui"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT I WANT BACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return in this exact order:
1. PAL Compile (3 lines: what you understood, what you're building, what's v1.1)
2. Section Plan (numbered list of every section you'll build)
3. Aesthetic Direction (one sentence: fonts + colors + motion style)
4. Reference Credit (which 2 templates influenced the design)
5. THE COMPLETE ARTIFACT (full working code — no placeholders, no Lorem ipsum)
6. Customize This (3-5 specific things to change for the real brand)

Rules:
- Complete artifact only. No half-pages. No wireframes.
- No Lorem ipsum. Write real copy based on what I told you or generate on-brand copy.
- No placeholder images — use CSS gradients, SVG patterns, or emoji placeholders styled beautifully.
- No generic aesthetics: no purple+white gradient, no Inter as display font, no cookie-cutter layouts.
- Mobile responsive always.
- At least one animation or micro-interaction.
- CTA buttons must be specific ("Start free" not "Click here").
```

---

## 📋 QUICK VERSION (for fast requests)

When you just need something quick without filling all fields:

```
Build me a [PAGE TYPE] for [PRODUCT/SITE].

User: [WHO]
Goal: [WHAT THE PAGE MUST MAKE THEM DO]
Vibe: [ONE WORD: bold / warm / minimal / editorial / dark / luxury]
Format: [HTML or React]

Use your judgment on sections, copy, and design.
Reference the [SITE TYPE] templates from your library.
Return PAL compile + section plan + complete artifact.
```

---

## 🎯 PRE-FILLED EXAMPLES

### Example 1 — Artispreneur Homepage

```
You are a world-class frontend designer using the webpage-designer skill.

Product: Artispreneur
Page: Homepage / Landing Page
Site type: SaaS
Format: Full HTML file

Primary user: Independent musicians and producers, 22-35, managing their career alone — no team, no manager, no lawyer
Page goal: Get them to click "Start free" and sign up for the free tier
Tone/vibe: Warm, editorial, music-industry credibility — like a magazine for serious artists

Brand colors: Red #C0272D, Gold #F5C100, Parchment bg #F9F6EF, Charcoal text #1A1A1A
Brand fonts: Playfair Display (headings) + Lato (body)

Sections:
- Sticky nav (logo + links + "Start free" CTA)
- Hero (bold headline, sub, dual CTA, product preview)
- Social proof bar (platforms: Spotify, Apple Music, SubmitHub, Distrokid logos or "X artists")
- Problem section ("You're doing it all alone")
- Features (Publishing Manager, Booking Manager, Brand Manager — 3 AI managers)
- How it works (3 steps)
- Pricing (Free / Premium $9.99 / Pro $29.99)
- Testimonials (3 artist quotes)
- Final CTA section
- Footer

Real copy:
- Headline: "Your Music Career Needs a Business"
- Subheadline: "Artispreneur gives independent artists the infrastructure major label artists take for granted."
- CTA 1: "Start free" (primary)
- CTA 2: "See how it works" (secondary)
- Tagline: "Art Means Business."

References: ClayAI (dark hero style), VitalFlow (card features section)

Constraints: CSS animations only (no JS libraries). Mobile responsive. No external JS.

Return: PAL compile + section plan + aesthetic direction + full HTML artifact + customize notes.
```

---

### Example 2 — ArtistEPKs.com Landing Page

```
You are a world-class frontend designer using the webpage-designer skill.

Product: ArtistEPKs.com (EPK generator for musicians)
Page: Hero landing page (above-the-fold focus, high conversion)
Site type: SaaS / Tool
Format: Full HTML file

Primary user: Musicians and bands pitching to labels, venues, brands, and blogs
Page goal: Get them to type in their artist name and generate a free EPK (zero-friction onboarding)
Tone/vibe: Editorial dark — label-quality, press-kit professional, music industry serious

Brand colors: Near-black bg #0A0A0A, Gold #F5C100, Warm white text #F0EDE8
Brand fonts: Cormorant Garamond (headings) + DM Mono (body/UI)

Sections:
- Minimal nav (logo left, "Sign in" right — no distracting links)
- Full-screen hero (artist name input → generate button, centered)
- How it works (3 steps: Enter info → AI builds → Download PDF)
- Sample EPK preview (mockup or styled card)
- Trust signals (label logos or "submitted to X A&Rs")
- Simple pricing (Free / Pro $9.99)
- Footer minimal

Real copy:
- Headline: "Your EPK in 10 Minutes"
- Sub: "Professional press kits that get you noticed. No designer. No agency. Just your music."
- CTA: "Build my EPK free →"
- Step labels: "1. Enter your info", "2. AI writes it", "3. Download & pitch"

Constraints: HTML only. CSS animations. Dark theme throughout.
```

---

### Example 3 — GencyAI Agency Page

```
You are a world-class frontend designer using the webpage-designer skill.

Product: GencyAI (AI sales ops agency for marketing agencies)
Page: Agency/service homepage
Site type: Agency / SaaS
Format: React JSX (Tailwind + shadcn/ui)

Primary user: Marketing and sales agency owners, 30-50, struggling to scale without headcount
Page goal: Get them to book a discovery call
Tone/vibe: Studio refined — agency credibility, clean, understated authority

Brand colors: Near-white bg #F8F8F6, Electric blue #2563EB, Deep slate text #0F172A
Brand fonts: Syne (headings, 700/800 weight) + Outfit (body)

Sections:
- Nav (logo + services + work + pricing + "Book a call" CTA)
- Hero (agency positioning + book call CTA + client logo strip)
- Services (3 core: GTM Architecture, Outbound Automation, Sales Intelligence)
- Case study teaser (result stat + client type)
- How we work (3-phase: Audit → Build → Launch)
- Pricing (3 tiers: Starter / Growth / Agency)
- FAQ (5 questions)
- Book a call CTA section
- Footer

Real copy:
- Headline: "An AI Sales Ops Team You Don't Have to Hire"
- Sub: "GencyAI builds the outbound systems, automation workflows, and sales intelligence your clients need — without adding headcount."
- CTA: "Book a discovery call"

Constraints: React/Tailwind only. Framer Motion allowed. shadcn/ui components preferred.
```

---

### Example 4 — Directory Page

```
You are a world-class frontend designer using the webpage-designer skill.

Product: [Your directory product name]
Page: Directory homepage + listing page
Site type: Directory
Format: Full HTML file

Primary user: [who searches the directory]
Page goal: Get them to search and click a listing
Tone/vibe: Clean, search-forward, editorial

Brand colors: [your colors]
Brand fonts: [your fonts]

Sections:
- Nav with search
- Hero with dominant search bar + category pills
- Featured listings (3-4 cards)
- Category grid (8 categories with icons)
- Recent listings (card grid, 6 items)
- "List your [thing]" CTA section
- Footer

References: ToolStack (Framer), Browse (Frameplate), Integrations Directory (Dribbble)
```

---

### Example 5 — Course Landing Page

```
You are a world-class frontend designer using the webpage-designer skill.

Product: [Course name] by [Creator]
Page: Course sales page
Site type: Course / LMS
Format: Full HTML file

Primary user: [Who takes this course, what they want to achieve]
Page goal: Enroll them in the course (paid or free)
Tone/vibe: Transformation-focused, aspirational but real

Brand colors: [your colors or generate]
Brand fonts: [your fonts or generate]

Sections:
- Nav (course logo + enroll CTA)
- Hero (transformation promise + instructor + "X students" social proof + enroll CTA)
- What you'll achieve (4-6 outcome bullets)
- Curriculum (module accordion)
- Instructor bio
- Testimonials (3 student results, specific)
- Pricing (1-2 tiers)
- FAQ
- Final CTA

References: Dribbble Course Web App, Dribbble Design Course Landing
```

---

## 🔧 MODIFIER ADD-ONS

Append any of these to your prompt for specific needs:

```
# DARK MODE: "Build in dark mode. All backgrounds near-black (#0A0A0A). Light text."

# MOBILE FIRST: "Prioritize mobile layout. Single column first. Desktop is enhancement."

# MINIMAL: "Strip to essentials. No decorative elements. Typography-first design."

# BOLD/LOUD: "Go maximalist. Big typography. Bold colors. Unexpected layouts. Make it unforgettable."

# CONVERT FOCUSED: "Maximize conversions. CTA above fold. Minimal nav. No exit points. Single action."

# ANIMATED: "Rich animations throughout. Framer Motion preferred. Stagger entries, parallax hero, hover reveals."

# COMPONENT ONLY: "Build just the [hero/pricing/nav/etc.] section, not the full page."

# RESKIN EXISTING: "Here is existing HTML: [paste code]. Reskin it with new brand: [details]."

# ADD SECTION: "Here is existing HTML: [paste code]. Add a [section name] section after [existing section]."
```

---

## ✅ QUALITY BAR CHECKLIST

Before accepting any output, check:

```
[ ] Above fold is complete and instantly communicates the value prop
[ ] Typography uses distinctive display + body pairing (not just Inter everywhere)
[ ] Color system uses CSS variables (easy to reskin)
[ ] Mobile responsive without horizontal scroll
[ ] At least one animation (fade up, stagger, hover state)
[ ] CTAs are specific ("Start free" not "Get started")
[ ] No Lorem ipsum anywhere
[ ] No placeholder text like "[YOUR HEADLINE]"
[ ] Footer is complete
[ ] Artifact runs without errors on first load
```

If any box is unchecked, say: "This section is missing [X]. Rebuild it."

---

## 🚀 FPE REMINDER

**Finish** — Don't accept partial outputs. Full page or nothing.
**Process** — PAL compile → section plan → build. Never code-first.
**Effective** — If it can't ship to real users, it's not done.

Art Means Business. 🎯
