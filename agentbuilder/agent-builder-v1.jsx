import { useState, useEffect, useRef } from "react";

// ============================================================
// AGENT BUILDER v1 — Pat Diamitani / Artispreneur OS
// Stack: React (artifact) → maps to Next.js 15 in production
// Powered by Claude API (claude-sonnet-4-5-20250929)
// ============================================================

const COLORS = {
  red: "#C0272D",
  gold: "#F5C100",
  parchment: "#F9F6EF",
  charcoal: "#1A1A1A",
  warmGray: "#4A4A4A",
  goldTint: "#FFF8D6",
  white: "#FFFFFF",
  border: "#E8E3D9",
  success: "#22c55e",
  muted: "#8a8070",
};

// ── Shared UI ──────────────────────────────────────────────

const Badge = ({ children, color = COLORS.gold, bg = COLORS.goldTint }) => (
  <span style={{
    background: bg, color: color, border: `1px solid ${color}40`,
    borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace"
  }}>{children}</span>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, style = {} }) => {
  const base = {
    border: "none", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Lato', sans-serif", fontWeight: 700, letterSpacing: "0.04em",
    transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
    display: "inline-flex", alignItems: "center", gap: 6,
  };
  const sizes = { sm: { padding: "6px 14px", fontSize: 12 }, md: { padding: "10px 20px", fontSize: 13 }, lg: { padding: "13px 28px", fontSize: 14 } };
  const variants = {
    primary: { background: COLORS.red, color: "#fff" },
    gold: { background: COLORS.gold, color: COLORS.charcoal },
    outline: { background: "transparent", color: COLORS.charcoal, border: `1px solid ${COLORS.border}` },
    ghost: { background: "transparent", color: COLORS.warmGray },
    danger: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{
    background: COLORS.white, border: `1px solid ${COLORS.border}`,
    borderRadius: 10, padding: 20, ...style
  }}>{children}</div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", rows, style = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.warmGray, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
    {rows ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: "'Lato', sans-serif", color: COLORS.charcoal, resize: "vertical", outline: "none", background: COLORS.parchment, ...style }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: "'Lato', sans-serif", color: COLORS.charcoal, outline: "none", background: COLORS.parchment, ...style }} />
    )}
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.warmGray, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "9px 12px", fontSize: 13, color: COLORS.charcoal, background: COLORS.parchment, outline: "none" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Tag = ({ label, onRemove }) => (
  <span style={{ background: COLORS.goldTint, border: `1px solid ${COLORS.gold}50`, borderRadius: 4, padding: "3px 10px", fontSize: 12, color: COLORS.charcoal, display: "inline-flex", alignItems: "center", gap: 6 }}>
    {label}
    {onRemove && <span onClick={onRemove} style={{ cursor: "pointer", color: COLORS.muted, fontWeight: 700 }}>×</span>}
  </span>
);

// ── Sidebar Nav ────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", icon: "⬛", label: "Dashboard" },
  { id: "agents", icon: "🤖", label: "Agents" },
  { id: "builder", icon: "⚙️", label: "Builder" },
  { id: "knowledge", icon: "📚", label: "Knowledge Base" },
  { id: "storage", icon: "🗄️", label: "Storage" },
  { id: "chat", icon: "💬", label: "Test Agent" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const Sidebar = ({ active, setActive, agents }) => (
  <div style={{
    width: 220, minHeight: "100vh", background: COLORS.charcoal, display: "flex",
    flexDirection: "column", padding: "0 0 20px 0", flexShrink: 0,
  }}>
    {/* Logo */}
    <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid #333` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, background: COLORS.red, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: COLORS.gold, fontSize: 18, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>A</span>
        </div>
        <div>
          <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700 }}>Agent Builder</div>
          <div style={{ color: COLORS.muted, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>by Artispreneur OS</div>
        </div>
      </div>
    </div>
    {/* Nav */}
    <nav style={{ flex: 1, padding: "12px 10px" }}>
      {NAV_ITEMS.map(item => (
        <button key={item.id} onClick={() => setActive(item.id)} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 6, border: "none", cursor: "pointer",
          background: active === item.id ? COLORS.red : "transparent",
          color: active === item.id ? "#fff" : "#aaa",
          fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: active === item.id ? 700 : 400,
          marginBottom: 2, textAlign: "left", transition: "all 0.15s",
        }}>
          <span style={{ fontSize: 15 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
    {/* Agent count */}
    <div style={{ padding: "12px 20px", borderTop: "1px solid #333" }}>
      <div style={{ color: COLORS.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Active Agents</div>
      <div style={{ color: COLORS.gold, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>{agents.length}</div>
    </div>
  </div>
);

// ── Dashboard ──────────────────────────────────────────────

const Dashboard = ({ agents, knowledgeDocs, storageFiles }) => {
  const stats = [
    { label: "Agents", value: agents.length, icon: "🤖", color: COLORS.red },
    { label: "KB Docs", value: knowledgeDocs.length, icon: "📄", color: "#3b82f6" },
    { label: "Files", value: storageFiles.length, icon: "🗂️", color: "#8b5cf6" },
    { label: "ARR Target", value: "$1M", icon: "🎯", color: COLORS.gold },
  ];
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: COLORS.charcoal, margin: 0 }}>Good morning, Pat 👋</h1>
        <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>Your agent team is standing by. Art Means Business.</p>
      </div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: "20px 16px" }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ color: COLORS.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      {/* NPAO Widget */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: COLORS.charcoal, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            NPAO Canvas
            <Badge>This Week</Badge>
          </div>
          {[
            { label: "N — Necessity", color: COLORS.red, items: ["Stripe integration live", "Landing page CTA working"] },
            { label: "A — Anxiety", color: "#f97316", items: ["Mobile responsive check", "Auth edge cases tested"] },
            { label: "P — Priority", color: "#3b82f6", items: ["Agent dashboard shipped", "DM batch approved + sent"] },
            { label: "O — Opportunity", color: COLORS.gold, items: ["SEO content plan", "Referral program"] },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: row.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{row.label}</div>
              {row.items.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: COLORS.warmGray }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: COLORS.charcoal, marginBottom: 14 }}>Quick Commands</div>
          {[
            { cmd: "Triage", desc: "Run NPAO canvas" },
            { cmd: "Status", desc: "Weekly report" },
            { cmd: "DM batch", desc: "30 outreach msgs" },
            { cmd: "Content drop", desc: "Week of content" },
            { cmd: "Ad copy", desc: "Google RSA ads" },
            { cmd: "Research", desc: "RAG DAL report" },
          ].map(item => (
            <div key={item.cmd} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.red, fontFamily: "monospace" }}>"{item.cmd}"</span>
              <span style={{ fontSize: 11, color: COLORS.muted }}>{item.desc}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ── Agent List ─────────────────────────────────────────────

const AGENT_ROLES = [
  "Chief of Staff", "Marketing Manager", "Content Writer", "DM Agent",
  "Social Media", "Promotions", "Research", "Paid Ads", "Sales", "Builder"
];

const AgentList = ({ agents, setActive, setBuilderAgent }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: COLORS.charcoal, margin: 0 }}>Agent Roster</h1>
        <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 3 }}>Your AI team. Read SOUL.md first — always.</p>
      </div>
      <Btn onClick={() => { setBuilderAgent(null); setActive("builder"); }}>+ New Agent</Btn>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
      {agents.map(agent => (
        <Card key={agent.id} style={{ cursor: "pointer", transition: "border-color 0.15s" }}
          onClick={() => { setBuilderAgent(agent); setActive("builder"); }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: agent.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {agent.emoji}
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: COLORS.charcoal }}>{agent.name}</div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>{agent.role}</div>
              </div>
            </div>
            <Badge color={agent.color} bg={agent.color + "15"}>{agent.tier}</Badge>
          </div>
          <p style={{ fontSize: 12, color: COLORS.warmGray, margin: "0 0 10px", lineHeight: 1.5 }}>{agent.description}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {agent.triggers.slice(0, 3).map(t => <Tag key={t} label={t} />)}
            {agent.triggers.length > 3 && <Tag label={`+${agent.triggers.length - 3}`} />}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ── Agent Builder ──────────────────────────────────────────

const EMOJIS = ["🧠", "📣", "✍️", "💬", "📱", "🎁", "🔬", "💰", "💼", "🏗️", "🔭", "🎯", "📊", "⚡", "🌟"];
const TIERS = [
  { value: "volume", label: "Volume — $10/mo" },
  { value: "core", label: "Core — $100/mo" },
  { value: "pro", label: "Pro — $1,000/mo" },
  { value: "agency", label: "Agency — $10,000/mo" },
];
const AGENT_COLORS = ["#C0272D", "#F5C100", "#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#06b6d4"];

const AgentBuilder = ({ agentData, onSave, knowledgeDocs }) => {
  const editing = !!agentData;
  const [form, setForm] = useState(agentData || {
    name: "", role: "", description: "", emoji: "🧠", color: COLORS.red,
    tier: "core", systemPrompt: "", triggers: [], persona: "",
    knowledgeDocs: [], npaoNotes: "", palProtocol: "",
  });
  const [triggerInput, setTriggerInput] = useState("");
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addTrigger = () => {
    if (!triggerInput.trim()) return;
    set("triggers", [...(form.triggers || []), triggerInput.trim()]);
    setTriggerInput("");
  };

  const removeTrigger = (i) => set("triggers", form.triggers.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!form.name || !form.systemPrompt) return;
    onSave({ ...form, id: form.id || Date.now() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: COLORS.charcoal, margin: 0 }}>
          {editing ? `Edit: ${form.name}` : "Build New Agent"}
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 3 }}>Configure your agent's identity, soul, and protocols.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: COLORS.charcoal }}>Identity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Agent Name" value={form.name} onChange={v => set("name", v)} placeholder="e.g. Chief of Staff" />
              <Select label="Role Type" value={form.role} onChange={v => set("role", v)}
                options={AGENT_ROLES.map(r => ({ value: r, label: r }))} />
              <Select label="Revenue Tier" value={form.tier} onChange={v => set("tier", v)} options={TIERS} />
              <Input label="Short Description" value={form.description} onChange={v => set("description", v)}
                placeholder="What does this agent do in one line?" rows={2} />
            </div>
          </Card>

          <Card>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: COLORS.charcoal }}>Appearance</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.warmGray, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Emoji</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => set("emoji", e)} style={{
                    width: 36, height: 36, borderRadius: 6, border: `2px solid ${form.emoji === e ? COLORS.red : COLORS.border}`,
                    background: form.emoji === e ? COLORS.red + "15" : "transparent", fontSize: 18, cursor: "pointer"
                  }}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.warmGray, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Color</div>
              <div style={{ display: "flex", gap: 8 }}>
                {AGENT_COLORS.map(c => (
                  <button key={c} onClick={() => set("color", c)} style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, border: `3px solid ${form.color === c ? COLORS.charcoal : "transparent"}`,
                    cursor: "pointer"
                  }} />
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: COLORS.charcoal }}>Trigger Words</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={triggerInput} onChange={e => setTriggerInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTrigger()}
                placeholder='e.g. "Triage", "Status"...'
                style={{ flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 12px", fontSize: 12, background: COLORS.parchment, outline: "none" }} />
              <Btn size="sm" onClick={addTrigger}>Add</Btn>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(form.triggers || []).map((t, i) => <Tag key={i} label={t} onRemove={() => removeTrigger(i)} />)}
            </div>
          </Card>

          <Card>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: COLORS.charcoal }}>Knowledge Base Links</div>
            <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10 }}>Attach KB documents this agent can reference.</p>
            {knowledgeDocs.length === 0 ? (
              <div style={{ fontSize: 12, color: COLORS.muted, fontStyle: "italic" }}>No KB docs yet — add them in the Knowledge Base tab.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {knowledgeDocs.map(doc => (
                  <label key={doc.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12 }}>
                    <input type="checkbox"
                      checked={(form.knowledgeDocs || []).includes(doc.id)}
                      onChange={e => {
                        const cur = form.knowledgeDocs || [];
                        set("knowledgeDocs", e.target.checked ? [...cur, doc.id] : cur.filter(d => d !== doc.id));
                      }} />
                    <span style={{ color: COLORS.charcoal }}>{doc.title}</span>
                    <Badge color={COLORS.muted} bg={COLORS.parchment}>{doc.type}</Badge>
                  </label>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 6, color: COLORS.charcoal }}>System Prompt (Soul)</div>
            <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10 }}>
              This is the agent's SOUL.md equivalent. Define who they are, what they do, their protocols, and their voice. Be specific.
            </p>
            <Input value={form.systemPrompt} onChange={v => set("systemPrompt", v)} rows={14}
              placeholder={`You are the [Role] for Pat Diamitani's million dollar portfolio.\n\nYour mission: [mission]\n\nYou always:\n- Run PAL before responding\n- Follow NPAO for task prioritization\n- Deliver output in ROSTR format\n\nYour tone: [voice attributes]\n\nCore protocols:\n[list your key protocols here]`} />
          </Card>

          <Card>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 6, color: COLORS.charcoal }}>PAL Protocol</div>
            <Input value={form.palProtocol} onChange={v => set("palProtocol", v)} rows={4}
              placeholder={"PARSE: This agent handles...\nABSTRACT: The simplest version of this task is...\nLAYER: v1 = [...], v1.1 = [...]"} />
          </Card>

          <Card>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 6, color: COLORS.charcoal }}>NPAO Notes</div>
            <Input value={form.npaoNotes} onChange={v => set("npaoNotes", v)} rows={4}
              placeholder={"N — Necessity blockers for this agent:\nA — Anxiety items to clear:\nP — Priority tasks:\nO — Opportunities:"} />
          </Card>

          <Card>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 6, color: COLORS.charcoal }}>Persona</div>
            <Input value={form.persona} onChange={v => set("persona", v)} rows={3}
              placeholder="Describe the agent's personality. How do they communicate? What's their style?" />
          </Card>

          {/* Save */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Btn onClick={handleSave} size="lg" disabled={!form.name || !form.systemPrompt}>
              {saved ? "✅ Saved!" : (editing ? "Save Changes" : "Create Agent")}
            </Btn>
            {(!form.name || !form.systemPrompt) && (
              <span style={{ fontSize: 11, color: COLORS.muted }}>Name and System Prompt required</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Knowledge Base ─────────────────────────────────────────

const KB_TYPES = ["SOUL", "Agent", "ICP", "GTM", "Competitor", "Product", "Playbook", "Research"];

const KnowledgeBase = ({ docs, setDocs }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "SOUL", content: "", tags: [], source: "" });
  const [tagInput, setTagInput] = useState("");
  const [search, setSearch] = useState("");

  const save = () => {
    if (!form.title || !form.content) return;
    setDocs(d => [...d, { ...form, id: Date.now(), createdAt: new Date().toLocaleDateString() }]);
    setForm({ title: "", type: "SOUL", content: "", tags: [], source: "" });
    setShowAdd(false);
  };

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.content.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  const typeColors = {
    SOUL: COLORS.red, Agent: "#3b82f6", ICP: "#22c55e", GTM: "#f97316",
    Competitor: "#8b5cf6", Product: COLORS.gold, Playbook: "#06b6d4", Research: "#ec4899"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: COLORS.charcoal, margin: 0 }}>Knowledge Base</h1>
          <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 3 }}>RAG-ready documents. Your agents read these.</p>
        </div>
        <Btn onClick={() => setShowAdd(!showAdd)}>+ Add Document</Btn>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
          style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "9px 14px", fontSize: 13, background: COLORS.white, outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Add form */}
      {showAdd && (
        <Card style={{ marginBottom: 20, background: COLORS.parchment }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: COLORS.charcoal }}>New Document</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Artispreneur ICP Research" />
            <Select label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
              options={KB_TYPES.map(t => ({ value: t, label: t }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Input label="Source URL (optional)" value={form.source} onChange={v => setForm(f => ({ ...f, source: v }))} placeholder="https://..." />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Input label="Content" value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} rows={6}
              placeholder="Paste document content, research notes, ICP details, agent SOUL.md, etc." />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={!form.title || !form.content}>Save Document</Btn>
          </div>
        </Card>
      )}

      {/* Doc list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.muted }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
            <div style={{ fontSize: 13 }}>{search ? "No documents match your search." : "No documents yet. Add SOUL.md, agent files, ICP research, and more."}</div>
          </div>
        )}
        {filtered.map(doc => (
          <Card key={doc.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: (typeColors[doc.type] || COLORS.muted) + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>📄</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: COLORS.charcoal }}>{doc.title}</span>
                <Badge color={typeColors[doc.type] || COLORS.muted} bg={(typeColors[doc.type] || COLORS.muted) + "15"}>{doc.type}</Badge>
                <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: "auto" }}>{doc.createdAt}</span>
              </div>
              <p style={{ fontSize: 12, color: COLORS.warmGray, margin: 0, lineHeight: 1.5 }}>
                {doc.content.slice(0, 150)}{doc.content.length > 150 ? "..." : ""}
              </p>
              {doc.source && <a href={doc.source} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: COLORS.red, textDecoration: "none", marginTop: 4, display: "block" }}>🔗 {doc.source}</a>}
            </div>
            <Btn size="sm" variant="danger" onClick={() => setDocs(d => d.filter(x => x.id !== doc.id))}>Delete</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── Storage ────────────────────────────────────────────────

const FILE_TYPES = ["Prompt", "Template", "Asset", "Schema", "Playbook", "Output", "Data"];

const Storage = ({ files, setFiles }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Prompt", content: "", description: "" });
  const [filter, setFilter] = useState("All");

  const save = () => {
    if (!form.name) return;
    setFiles(f => [...f, { ...form, id: Date.now(), size: form.content.length + " chars", createdAt: new Date().toLocaleDateString() }]);
    setForm({ name: "", type: "Prompt", content: "", description: "" });
    setShowAdd(false);
  };

  const filtered = filter === "All" ? files : files.filter(f => f.type === filter);

  const typeIcons = { Prompt: "📝", Template: "🗒️", Asset: "🖼️", Schema: "🗃️", Playbook: "📋", Output: "📤", Data: "📊" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: COLORS.charcoal, margin: 0 }}>Storage</h1>
          <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 3 }}>Prompts, templates, schemas, and agent outputs.</p>
        </div>
        <Btn onClick={() => setShowAdd(!showAdd)}>+ Add File</Btn>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["All", ...FILE_TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: "5px 14px", borderRadius: 20, border: `1px solid ${COLORS.border}`,
            background: filter === t ? COLORS.red : "transparent",
            color: filter === t ? "#fff" : COLORS.warmGray,
            fontSize: 12, cursor: "pointer", fontFamily: "'Lato', sans-serif"
          }}>{t}</button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <Card style={{ marginBottom: 20, background: COLORS.parchment }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: COLORS.charcoal }}>New File</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Input label="File Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. artispreneur-system-prompt.md" />
            <Select label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={FILE_TYPES.map(t => ({ value: t, label: t }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Input label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="What is this file for?" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Input label="Content" value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} rows={6} placeholder="Paste content here..." />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={!form.name}>Save File</Btn>
          </div>
        </Card>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {filtered.map(file => (
          <Card key={file.id} style={{ position: "relative" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{typeIcons[file.type] || "📄"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: COLORS.charcoal }}>{file.name}</span>
              <Badge>{file.type}</Badge>
            </div>
            {file.description && <p style={{ fontSize: 11, color: COLORS.muted, margin: "0 0 8px", lineHeight: 1.4 }}>{file.description}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 10, color: COLORS.muted, fontFamily: "monospace" }}>{file.size} · {file.createdAt}</span>
              <Btn size="sm" variant="ghost" onClick={() => setFiles(f => f.filter(x => x.id !== file.id))}>✕</Btn>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: COLORS.muted }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗄️</div>
            <div style={{ fontSize: 13 }}>No files {filter !== "All" ? `of type "${filter}" ` : ""}yet.</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Chat / Test Agent ──────────────────────────────────────

const Chat = ({ agents, knowledgeDocs }) => {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const agent = agents.find(a => a.id === selectedAgent);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildSystemPrompt = () => {
    let prompt = agent?.systemPrompt || "You are a helpful AI assistant.";
    const attachedDocs = knowledgeDocs.filter(d => (agent?.knowledgeDocs || []).includes(d.id));
    if (attachedDocs.length > 0) {
      prompt += "\n\n--- KNOWLEDGE BASE ---\n";
      attachedDocs.forEach(doc => {
        prompt += `\n## ${doc.title} (${doc.type})\n${doc.content}\n`;
      });
    }
    return prompt;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "No response.";
      setMessages(m => [...m, { role: "assistant", content: text }]);
    } catch (e) {
      setError("API call failed. In production this routes through your Next.js API route with your ANTHROPIC_API_KEY.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: COLORS.charcoal, margin: 0 }}>Test Agent</h1>
          <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 3 }}>Chat with your agents. Test before shipping.</p>
        </div>
        <Select value={selectedAgent || ""} onChange={v => { setSelectedAgent(v); setMessages([]); }}
          options={agents.map(a => ({ value: a.id, label: `${a.emoji} ${a.name}` }))} />
      </div>

      {/* Agent info bar */}
      {agent && (
        <div style={{ background: agent.color + "15", border: `1px solid ${agent.color}30`, borderRadius: 8, padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>{agent.emoji}</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.charcoal }}>{agent.name}</span>
            <span style={{ color: COLORS.muted, fontSize: 11, marginLeft: 8 }}>{agent.role}</span>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, color: COLORS.muted }}>
            {(agent.knowledgeDocs || []).length} KB doc{(agent.knowledgeDocs || []).length !== 1 ? "s" : ""} attached
          </span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4, marginBottom: 14 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.muted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{agent?.emoji || "💬"}</div>
            <div style={{ fontSize: 13 }}>{agent ? `Say anything to ${agent.name}.` : "Select an agent above to start."}</div>
            {agent?.triggers?.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                {agent.triggers.slice(0, 4).map(t => (
                  <button key={t} onClick={() => setInput(t)} style={{
                    padding: "4px 12px", borderRadius: 20, border: `1px solid ${COLORS.border}`,
                    background: COLORS.parchment, fontSize: 12, cursor: "pointer", color: COLORS.charcoal
                  }}>"{t}"</button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "72%", padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? COLORS.red : COLORS.parchment,
              color: msg.role === "user" ? "#fff" : COLORS.charcoal,
              fontSize: 13, lineHeight: 1.6, border: msg.role === "assistant" ? `1px solid ${COLORS.border}` : "none",
            }}>
              <pre style={{ margin: 0, fontFamily: "'Lato', sans-serif", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ padding: "10px 14px", background: COLORS.parchment, borderRadius: 14, border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.muted }}>
              {agent?.name || "Agent"} is thinking...
            </div>
          </div>
        )}
        {error && <div style={{ color: "#dc2626", fontSize: 12, background: "#fee2e2", padding: "8px 12px", borderRadius: 6 }}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={agent ? `Message ${agent.name}... (Enter to send)` : "Select an agent first"}
          rows={2} disabled={!agent || loading}
          style={{ flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, resize: "none", outline: "none", background: COLORS.parchment, fontFamily: "'Lato', sans-serif" }} />
        <Btn onClick={send} disabled={!input.trim() || !agent || loading} size="lg">Send ↑</Btn>
      </div>
    </div>
  );
};

// ── Settings ───────────────────────────────────────────────

const Settings = () => (
  <div>
    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: COLORS.charcoal, margin: "0 0 22px" }}>Settings</h1>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <Card>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: COLORS.charcoal }}>API Keys</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Anthropic API Key" value="" onChange={() => {}} placeholder="sk-ant-..." type="password" />
          <Input label="Supabase URL" value="" onChange={() => {}} placeholder="https://[project].supabase.co" />
          <Input label="Supabase Anon Key" value="" onChange={() => {}} placeholder="eyJ..." type="password" />
          <Btn size="sm">Save Keys</Btn>
        </div>
      </Card>
      <Card>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: COLORS.charcoal }}>Product Config</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Product Name" value="Artispreneur" onChange={() => {}} />
          <Select label="Default Revenue Tier" value="core" onChange={() => {}}
            options={[{ value: "volume", label: "Volume — $10/mo" }, { value: "core", label: "Core — $100/mo" }, { value: "pro", label: "Pro — $1K/mo" }, { value: "agency", label: "Agency — $10K/mo" }]} />
          <Input label="ARR Target" value="$1,000,000" onChange={() => {}} />
        </div>
      </Card>
      <Card style={{ gridColumn: "1/-1" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, marginBottom: 10, color: COLORS.charcoal }}>Production Build Instructions</div>
        <div style={{ background: COLORS.charcoal, borderRadius: 8, padding: 16, fontFamily: "monospace", fontSize: 12, color: "#4ade80", lineHeight: 1.8 }}>
          <div style={{ color: COLORS.muted }}>$ # Full stack setup</div>
          <div>npx create-next-app@latest agent-builder --typescript --tailwind</div>
          <div>cd agent-builder</div>
          <div>npm install @supabase/supabase-js @anthropic-ai/sdk stripe zustand</div>
          <div>npx shadcn@latest init</div>
          <div style={{ color: COLORS.muted, marginTop: 8 }}># Add env vars → deploy to Vercel</div>
          <div style={{ color: COLORS.muted }}># See PROMPT_INSTRUCTIONS.md for full build guide</div>
        </div>
      </Card>
    </div>
  </div>
);

// ── Seed Data ──────────────────────────────────────────────

const SEED_AGENTS = [
  {
    id: 1, emoji: "🧠", name: "Chief of Staff", role: "Chief of Staff", tier: "core", color: COLORS.red,
    description: "Orchestrates all other agents. Runs NPAO triage, weekly status reports, task routing.",
    triggers: ["Triage", "Status", "What's next", "Weekly report"],
    systemPrompt: "You are the Chief of Staff for Pat Diamitani's Million Dollar Portfolio.\n\nYou orchestrate all other agents. You never do the work — you assign, prioritize, track, and report.\n\nAlways run NPAO triage:\nN — Necessity: What are the hard blockers?\nA — Anxiety: What open loops need clearing?\nP — Priority: What moves the mission?\nO — Opportunity: What compounds growth?\n\nReturn structured reports. Be concise. Lead with status.",
    triggers2: [], knowledgeDocs: [], palProtocol: "", npaoNotes: "", persona: "Direct, no-fluff, organized."
  },
  {
    id: 2, emoji: "💬", name: "DM Agent", role: "DM Agent", tier: "volume", color: "#3b82f6",
    description: "Writes all direct message outreach. LinkedIn, Instagram, Twitter/X. Always drafts for approval.",
    triggers: ["DM batch", "Write outreach", "DM sequence", "Outreach"],
    systemPrompt: "You are the DM Agent for Artispreneur.\n\nYou write outreach that sounds human, gets replies, and starts conversations that convert.\n\nRules:\n- Never pitch in message 1\n- Open with specific observation about them\n- Under 5 lines per message\n- Never start with 'I'\n- Always draft — Pat approves before sending\n\nICP: Independent musicians/artists, 22-35, 1K-100K followers.",
    knowledgeDocs: [], palProtocol: "", npaoNotes: "", persona: "Conversational, peer-to-peer, never salesy."
  },
  {
    id: 3, emoji: "📣", name: "Marketing Manager", role: "Marketing Manager", tier: "core", color: "#f97316",
    description: "Owns GTM strategy, channel planning, and 30-day launch playbooks.",
    triggers: ["GTM plan", "Launch mode", "Channel strategy", "Marketing"],
    systemPrompt: "You are the Marketing Manager for Artispreneur.\n\nYou think like a CMO, execute like a team of one.\n\nAlways know the revenue tier: Core ($100/mo, 1K users = $1M ARR)\n\nFor every task:\n1. Identify the channel with highest ROI for this audience\n2. Assign specific KPIs\n3. Create a sequenced action plan\n\nArtispreneur ICP: Independent artists, 22-35, 1K-100K followers, managing their career alone.",
    knowledgeDocs: [], palProtocol: "", npaoNotes: "", persona: "Strategic, data-driven, action-oriented."
  },
];

const SEED_DOCS = [
  { id: 1, title: "SOUL.md — Universal Identity", type: "SOUL", content: "Every agent reads this first.\n\nMission: Build a $1M ARR portfolio.\nFPE: Finish. Process. Effective.\nNPAO: Necessity → Anxiety → Priority → Opportunity.\nPAL: Parse → Abstract → Layer.\nROSTR: Receive → Orchestrate → Synthesize → Transform → Return.", source: "", createdAt: "5/19/26", tags: [] },
  { id: 2, title: "Artispreneur ICP Research", type: "ICP", content: "PRIMARY ICP: Independent musician/producer/songwriter\nAge: 22-35\nFollowers: 1K-100K\nPain: Managing career alone\nTrigger: First booking inquiry or label interest\nWatering holes: r/WeAreTheMusicMakers, SubmitHub, Discord music servers\n\nExact words they use:\n'I don't know how to register with a PRO'\n'I need a contract but don't have one'\n'I need a professional EPK'", source: "", createdAt: "5/19/26", tags: [] },
];

const SEED_FILES = [
  { id: 1, name: "artispreneur-system-prompt.md", type: "Prompt", description: "Master system prompt for Artispreneur agents", content: "Art Means Business.", size: "420 chars", createdAt: "5/19/26" },
  { id: 2, name: "dm-sequence-template.md", type: "Template", description: "3-touch DM sequence for Instagram outreach", content: "Touch 1...", size: "280 chars", createdAt: "5/19/26" },
];

// ── App Root ───────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [agents, setAgents] = useState(SEED_AGENTS);
  const [knowledgeDocs, setKnowledgeDocs] = useState(SEED_DOCS);
  const [storageFiles, setStorageFiles] = useState(SEED_FILES);
  const [builderAgent, setBuilderAgent] = useState(null);

  const saveAgent = (agent) => {
    setAgents(prev => {
      const exists = prev.find(a => a.id === agent.id);
      return exists ? prev.map(a => a.id === agent.id ? agent : a) : [...prev, agent];
    });
    setActiveTab("agents");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Lato', sans-serif", background: COLORS.parchment }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet" />

      <Sidebar active={activeTab} setActive={setActiveTab} agents={agents} />

      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        {activeTab === "dashboard" && <Dashboard agents={agents} knowledgeDocs={knowledgeDocs} storageFiles={storageFiles} />}
        {activeTab === "agents" && <AgentList agents={agents} setActive={setActiveTab} setBuilderAgent={setBuilderAgent} />}
        {activeTab === "builder" && <AgentBuilder agentData={builderAgent} onSave={saveAgent} knowledgeDocs={knowledgeDocs} />}
        {activeTab === "knowledge" && <KnowledgeBase docs={knowledgeDocs} setDocs={setKnowledgeDocs} />}
        {activeTab === "storage" && <Storage files={storageFiles} setFiles={setStorageFiles} />}
        {activeTab === "chat" && <Chat agents={agents} knowledgeDocs={knowledgeDocs} />}
        {activeTab === "settings" && <Settings />}
      </main>
    </div>
  );
}
