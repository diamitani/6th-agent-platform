# Design Tokens — Pat's Products
## Reference for webpage-designer SKILL.md

---

## Artispreneur

```css
:root {
  /* Brand */
  --color-primary:    #C0272D;  /* Red — energy, authority */
  --color-accent:     #F5C100;  /* Gold — aspiration, music */
  --color-bg:         #F9F6EF;  /* Parchment — warmth, craft */
  --color-text:       #1A1A1A;  /* Charcoal — grounded */
  --color-text-muted: #8a8070;  /* Warm gray */
  --color-border:     #E8E3D9;  /* Soft warm border */
  --color-white:      #FFFFFF;
  --color-gold-tint:  #FFF8D6;  /* Gold at 10% */

  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;  /* H1, H2, brand */
  --font-body:    'Lato', sans-serif;                  /* Body, UI */

  /* Scale */
  --text-xs:  11px;
  --text-sm:  13px;
  --text-md:  15px;
  --text-lg:  18px;
  --text-xl:  24px;
  --text-2xl: 32px;
  --text-3xl: 48px;
  --text-4xl: 64px;

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-6: 24px;  --space-8: 32px;
  --space-10: 40px; --space-12: 48px; --space-16: 64px;
  --space-20: 80px; --space-24: 96px;

  /* Radius */
  --radius-sm: 4px; --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 20px;
}
```

**Aesthetic:** Warm Creative. Editorial. Music-industry gravitas meets independent spirit.
**Font import:** `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap`

---

## ArtistEPKs.com

```css
:root {
  --color-bg:         #0A0A0A;  /* Near black */
  --color-surface:    #141414;  /* Card/panel bg */
  --color-primary:    #F5C100;  /* Gold — prestige */
  --color-accent:     #C0272D;  /* Red — urgency */
  --color-text:       #F0EDE8;  /* Warm white */
  --color-text-muted: #888;
  --color-border:     #2a2a2a;

  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Mono', 'Courier New', monospace;
  /* Alt body: 'DM Sans', sans-serif */
}
```

**Aesthetic:** Editorial Dark. Label-quality. Press-kit serious.
**Font import:** `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono&display=swap`

---

## GencyAI

```css
:root {
  --color-bg:         #F8F8F6;  /* Near white, cool */
  --color-surface:    #FFFFFF;
  --color-primary:    #2563EB;  /* Electric blue */
  --color-accent:     #7C3AED;  /* Purple — AI feel */
  --color-text:       #0F172A;  /* Deep slate */
  --color-text-muted: #64748B;
  --color-border:     #E2E8F0;

  --font-display: 'Syne', sans-serif;
  --font-body:    'Outfit', sans-serif;
}
```

**Aesthetic:** Studio Refined. Agency credibility. AI authority.
**Font import:** `https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600&display=swap`

---

## Atlas HXM (GTM / B2B)

```css
:root {
  --color-bg:         #0F1117;  /* Deep navy-black */
  --color-surface:    #1A1F2E;
  --color-primary:    #3B82F6;  /* Atlas blue */
  --color-accent:     #06B6D4;  /* Cyan — data, speed */
  --color-text:       #F1F5F9;
  --color-text-muted: #94A3B8;
  --color-border:     #1E293B;

  --font-display: 'Bebas Neue', sans-serif;  /* Impact without the cheese */
  --font-body:    'Inter', sans-serif;       /* Exception: Atlas is enterprise */
}
```

**Aesthetic:** Bold SaaS. Enterprise trust. Data-forward.
**Font import:** `https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap`

---

## LiveBuildAI

```css
:root {
  --color-bg:         #09090B;
  --color-surface:    #18181B;
  --color-primary:    #22C55E;  /* Green — build, ship */
  --color-accent:     #F59E0B;  /* Amber — energy */
  --color-text:       #FAFAFA;
  --color-text-muted: #A1A1AA;
  --color-border:     #27272A;

  --font-display: 'Space Grotesk', sans-serif;
  --font-body:    'Lato', sans-serif;
}
```

**Aesthetic:** Bold SaaS. Creator energy. Build-in-public feel.
**Font import:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Lato:wght@400;700&display=swap`

---

## Generic (when no product specified)

```css
:root {
  /* Let the aesthetic direction drive the tokens */
  /* Pull from one of the above or create from scratch */
  /* Never default to purple + white or blue + white */
}
```

Rule: If no product specified, ASK which product OR infer from context.
If truly unknown, default to Editorial Dark (most impressive, most distinctive).
