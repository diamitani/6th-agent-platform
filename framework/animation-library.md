# Animation Library
## CSS + Framer Motion snippets for webpage-designer

---

## CSS-Only Animations (use in HTML artifacts)

### Fade In Up (hero entrance)
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fadeInUp 0.6s ease forwards;
}
.animate-fade-up.delay-1 { animation-delay: 0.1s; opacity: 0; }
.animate-fade-up.delay-2 { animation-delay: 0.2s; opacity: 0; }
.animate-fade-up.delay-3 { animation-delay: 0.35s; opacity: 0; }
.animate-fade-up.delay-4 { animation-delay: 0.5s; opacity: 0; }
```

### Stagger cards on load
```css
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.card-grid .card {
  animation: cardIn 0.5s ease forwards;
  opacity: 0;
}
.card-grid .card:nth-child(1) { animation-delay: 0.05s; }
.card-grid .card:nth-child(2) { animation-delay: 0.12s; }
.card-grid .card:nth-child(3) { animation-delay: 0.19s; }
.card-grid .card:nth-child(4) { animation-delay: 0.26s; }
```

### Hover lift (cards, buttons)
```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}
```

### Gradient shimmer (loading / accent)
```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.shimmer-text {
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-primary) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}
```

### Marquee / logo scroll
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  animation: marquee 20s linear infinite;
  width: max-content;
}
.marquee-wrapper {
  overflow: hidden;
  -webkit-mask: linear-gradient(90deg, transparent, #fff 10%, #fff 90%, transparent);
}
```

### Accordion open/close
```css
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease, padding 0.2s ease;
}
.accordion-content.open {
  max-height: 500px;
}
```

### Sticky nav bg on scroll (JS-assisted)
```css
.nav { transition: background 0.3s ease, backdrop-filter 0.3s ease; }
.nav.scrolled {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}
```
```js
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 20);
});
```

---

## Framer Motion Snippets (React artifacts)

```jsx
import { motion } from "framer-motion";

// Fade in up — hero text
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

// Stagger children (card grid)
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};
const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 }
};

// Usage:
<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>{item.name}</motion.div>
  ))}
</motion.div>

// Scroll-triggered reveal
import { useInView } from "framer-motion";
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-100px" });

<motion.section
  ref={ref}
  initial={{ opacity: 0, y: 40 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.7, ease: "easeOut" }}
>

// Hover card
<motion.div
  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>

// Page transition (Next.js layout)
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

---

## Animation Rules

**Use freely:**
- Fade in up on page load (hero, heading, subtext)
- Stagger on card grids
- Hover lift on interactive cards
- Sticky nav bg on scroll

**Use sparingly (1 per page):**
- Shimmer/gradient text effect
- Marquee/scroll strip
- Parallax background

**Never use:**
- Rotating elements without purpose
- Bounce animations on serious products (SaaS, B2B, medical)
- Animations on every single element
- Animation that delays content > 300ms

**Artispreneur:** Gentle, warm, spring-based. Nothing aggressive.
**ArtistEPKs:** Slow, cinematic. Long fade durations (0.8-1.2s).
**Atlas/GencyAI:** Fast, precise. Short durations (0.2-0.4s). No bounce.
**E-commerce:** Quick hover states. Image zoom on hover.
