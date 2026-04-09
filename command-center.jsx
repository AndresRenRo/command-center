import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "command-center-v2";

// ─── localStorage helpers ───
const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.targets) parsed.targets = SEED_TARGETS;
      return parsed;
    }
  } catch (e) {
    console.error("Error loading data:", e);
  }
  return null;
};

const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving data:", e);
  }
};

// ─── Preloaded Pitch Targets ───
const SEED_TARGETS = [
  { id: "t01", name: "Slow Tech / Back Market", tier: "Tier 1", rate: "$675/article", vertical: "Tech", url: "suremedia.agency", source: "SureMedia", pitched: false, status: "new", notes: "Via SureMedia /tag/tech" },
  { id: "t02", name: "Vogue Business", tier: "Tier 1", rate: "$0.75/word", vertical: "Business", url: "", source: "SureMedia", pitched: false, status: "new", notes: "High-end. Pitch must be airtight." },
  { id: "t03", name: "Globe and Mail", tier: "Tier 1", rate: "$300–400 CAD", vertical: "Finance", url: "", source: "SureMedia", pitched: false, status: "new", notes: "Canadian. Finance/business angle." },
  { id: "t04", name: "Mint Studios (Araminta)", tier: "Tier 1", rate: "$300–600/article", vertical: "Finance", url: "mintstudios.com", source: "Mint Cave", pitched: false, status: "new", notes: "Finance content. Model to study." },
  { id: "t05", name: "LendEDU", tier: "Tier 2", rate: "TBD", vertical: "Finance", url: "lendedu.com", source: "Mint Cave", pitched: false, status: "new", notes: "Finance/personal finance." },
  { id: "t06", name: "Gizmodo", tier: "Tier 2", rate: "$100/article", vertical: "Tech", url: "gizmodo.com", source: "SureMedia", pitched: false, status: "new", notes: "Low rate but byline value." },
  { id: "t07", name: "Business Insider", tier: "Tier 2", rate: "$0.30/word", vertical: "Business", url: "businessinsider.com", source: "Research", pitched: false, status: "new", notes: "Essays $200–300. Features paid more." },
  { id: "t08", name: "Cosmopolitan", tier: "Tier 2", rate: "$250/article", vertical: "Lifestyle", url: "", source: "SureMedia", pitched: false, status: "new", notes: "" },
  { id: "t09", name: "Writer's Digest", tier: "Tier 1", rate: "$0.50/word", vertical: "Writing", url: "writersdigest.com", source: "SureMedia", pitched: false, status: "new", notes: "Meta: writing about writing. HGR angle?" },
  { id: "t10", name: "WIRED", tier: "Tier 1", rate: "$250–3,000+", vertical: "Tech", url: "wired.com", source: "Research", pitched: false, status: "new", notes: "Minifeatures $3K. Online shorter $250+." },
  { id: "t11", name: "MIT Technology Review", tier: "Tier 1", rate: "$1–2/word", vertical: "Tech", url: "technologyreview.com", source: "Research", pitched: false, status: "new", notes: "Accepts non-US writers. Bimensual calls for pitches." },
  { id: "t12", name: "TIME Magazine", tier: "Tier 1", rate: "$500+", vertical: "Business", url: "time.com", source: "Research", pitched: false, status: "new", notes: "Tech and business stories." },
  { id: "t13", name: "Smithsonian Magazine", tier: "Tier 2", rate: "$0.36/word", vertical: "Culture", url: "smithsonianmag.com", source: "Research", pitched: false, status: "new", notes: "Art, history, science, innovation." },
  { id: "t14", name: "Quanta Magazine", tier: "Tier 1", rate: "$1.75/word", vertical: "Science", url: "quantamagazine.org", source: "Research", pitched: false, status: "new", notes: "Math, physics, life sciences. High bar." },
  { id: "t15", name: "Discover Magazine", tier: "Tier 1", rate: "$1.50/word", vertical: "Science", url: "discovermagazine.com", source: "Research", pitched: false, status: "new", notes: "2,500–3,000 word features." },
  { id: "t16", name: "HackerNoon", tier: "Active", rate: "Free / exposure", vertical: "Tech", url: "hackernoon.com", source: "Direct", pitched: true, status: "active", notes: "Already published. Build backlink + authority." },
  { id: "t17", name: "Rolling Stone", tier: "Tier 1", rate: "Negotiable", vertical: "Culture", url: "rollingstone.com", source: "Research", pitched: false, status: "new", notes: "Politics, music, culture. Exclusive scoops." },
];

const DEFAULT_DATA = {
  prospects: [],
  editorial: [],
  targets: SEED_TARGETS,
};

const VERTICALS = ["iGaming", "Crypto", "Fintech", "LATAM SaaS", "Media", "Other"];
const PROSPECT_STATUS = [
  { value: "lead", label: "Lead", color: "#555" },
  { value: "contacted", label: "Contacted", color: "#b8860b" },
  { value: "replied", label: "Replied", color: "#2d6a4f" },
  { value: "call", label: "Call", color: "#1d4ed8" },
  { value: "client", label: "Client", color: "#00ff41" },
  { value: "dead", label: "Dead", color: "#dc2626" },
];

const CHANNELS = ["País Lector", "HackerNoon", "HGR", "La Columna", "External Pitch"];
const EDITORIAL_STATUS = [
  { value: "idea", label: "Idea", color: "#555" },
  { value: "draft", label: "Borrador", color: "#b8860b" },
  { value: "editing", label: "Editando", color: "#1d4ed8" },
  { value: "published", label: "Publicado", color: "#2d6a4f" },
  { value: "distributed", label: "Distribuido", color: "#00ff41" },
];

const TARGET_STATUS = [
  { value: "new", label: "Nuevo", color: "#555" },
  { value: "researching", label: "Investigando", color: "#b8860b" },
  { value: "pitched", label: "Pitched", color: "#1d4ed8" },
  { value: "accepted", label: "Aceptado", color: "#2d6a4f" },
  { value: "active", label: "Activo", color: "#00ff41" },
  { value: "rejected", label: "Rechazado", color: "#dc2626" },
];

const TARGET_TIERS = ["Tier 1", "Tier 2", "Active"];
const TARGET_VERTICALS = ["Tech", "Business", "Finance", "Science", "Culture", "Writing", "Lifestyle", "Other"];
const TARGET_SOURCES = ["SureMedia", "Mint Cave", "Research", "Direct", "Referral", "Other"];

const EXTERNAL_TARGETS = [
  "Forests", "Vogue Business", "Globe and Mail", "Mint Studios",
  "LendEDU", "Gizmodo", "Insider", "Writer's Digest", "Cosmopolitan", "WIRED",
  "MIT Tech Review", "TIME", "Rolling Stone", "Other"
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
};

// ─── Styles ───
const font = `'IBM Plex Mono', 'SF Mono', 'Fira Code', monospace`;
const fontSans = `'DM Sans', 'Helvetica Neue', sans-serif`;

const S = {
  app: { minHeight: "100vh", background: "#0a0a0a", color: "#e0e0e0", fontFamily: fontSans, fontSize: 14 },
  header: { padding: "24px 32px 0", display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  logo: { fontFamily: font, fontSize: 22, fontWeight: 700, color: "#00ff41", letterSpacing: "-0.5px", textTransform: "uppercase" },
  subtitle: { fontFamily: font, fontSize: 11, color: "#666", letterSpacing: "2px", textTransform: "uppercase" },
  tabs: { display: "flex", gap: 0, margin: "20px 32px 0", borderBottom: "1px solid #1a1a1a", overflowX: "auto" },
  tab: (a) => ({ padding: "10px 20px", fontFamily: font, fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: a ? "#00ff41" : "#666", background: a ? "#111" : "transparent", border: "none", borderBottom: a ? "2px solid #00ff41" : "2px solid transparent", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }),
  content: { padding: "24px 32px" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  addBtn: { padding: "8px 20px", background: "#00ff41", color: "#0a0a0a", border: "none", fontFamily: font, fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", cursor: "pointer", textTransform: "uppercase" },
  filterBar: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterBtn: (a) => ({ padding: "4px 10px", background: a ? "#1a1a1a" : "transparent", color: a ? "#00ff41" : "#555", border: `1px solid ${a ? "#00ff41" : "#222"}`, fontFamily: font, fontSize: 10, cursor: "pointer", letterSpacing: "0.5px", textTransform: "uppercase" }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 12px", fontFamily: font, fontSize: 10, fontWeight: 600, color: "#555", letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: "1px solid #1a1a1a" },
  td: { padding: "10px 12px", borderBottom: "1px solid #111", fontSize: 13, verticalAlign: "top" },
  badge: (c) => ({ display: "inline-block", padding: "2px 8px", background: c + "22", color: c, fontFamily: font, fontSize: 10, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", border: `1px solid ${c}44` }),
  input: { background: "#111", border: "1px solid #222", color: "#e0e0e0", padding: "6px 10px", fontFamily: fontSans, fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" },
  select: { background: "#111", border: "1px solid #222", color: "#e0e0e0", padding: "6px 10px", fontFamily: fontSans, fontSize: 13, outline: "none", cursor: "pointer" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { background: "#111", border: "1px solid #222", padding: "28px 32px", maxWidth: 480, width: "90%", maxHeight: "85vh", overflowY: "auto" },
  modalTitle: { fontFamily: font, fontSize: 14, fontWeight: 700, color: "#00ff41", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20 },
  formGroup: { marginBottom: 14 },
  label: { display: "block", fontFamily: font, fontSize: 10, color: "#666", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 },
  cancelBtn: { padding: "8px 20px", background: "transparent", color: "#666", border: "1px solid #333", fontFamily: font, fontSize: 11, cursor: "pointer", textTransform: "uppercase" },
  saveBtn: { padding: "8px 20px", background: "#00ff41", color: "#0a0a0a", border: "none", fontFamily: font, fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" },
  deleteBtn: { padding: "8px 20px", background: "transparent", color: "#dc2626", border: "1px solid #dc262644", fontFamily: font, fontSize: 11, cursor: "pointer", textTransform: "uppercase", marginRight: "auto" },
  empty: { textAlign: "center", padding: "60px 20px", color: "#333", fontFamily: font, fontSize: 13, letterSpacing: "1px" },
  stats: { display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" },
  stat: { display: "flex", flexDirection: "column", gap: 2 },
  statValue: { fontFamily: font, fontSize: 28, fontWeight: 700, color: "#00ff41", lineHeight: 1 },
  statLabel: { fontFamily: font, fontSize: 9, color: "#555", letterSpacing: "1.5px", textTransform: "uppercase" },
  row: (i) => ({ cursor: "pointer", transition: "background 0.1s", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }),
  tierBadge: (t) => {
    const c = { "Tier 1": "#f59e0b", "Tier 2": "#6b7280", "Active": "#00ff41" }[t] || "#555";
    return { display: "inline-block", padding: "2px 8px", background: c + "18", color: c, fontFamily: font, fontSize: 10, fontWeight: 600, letterSpacing: "0.5px", border: `1px solid ${c}33` };
  },
  exportBtn: { padding: "6px 14px", background: "transparent", color: "#555", border: "1px solid #222", fontFamily: font, fontSize: 10, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px" },
};

function StatusBadge({ value, options }) {
  const opt = options.find((o) => o.value === value) || options[0];
  return <span style={S.badge(opt.color)}>{opt.label}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalTitle}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function ProspectForm({ item, onSave, onDelete, onClose }) {
  const [f, setF] = useState(item || { id: uid(), name: "", company: "", vertical: VERTICALS[0], status: "lead", coldSent: false, lastContact: "", notes: "", created: new Date().toISOString() });
  const s = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Editar Prospecto" : "Nuevo Prospecto"} onClose={onClose}>
      <div style={S.formGroup}><label style={S.label}>Nombre / Contacto</label><input style={S.input} value={f.name} onChange={(e) => s("name", e.target.value)} placeholder="Ej: Alejandra – MDC Trading" /></div>
      <div style={S.formGroup}><label style={S.label}>Empresa</label><input style={S.input} value={f.company} onChange={(e) => s("company", e.target.value)} /></div>
      <div style={S.formGroup}><label style={S.label}>Vertical</label><select style={{ ...S.select, width: "100%" }} value={f.vertical} onChange={(e) => s("vertical", e.target.value)}>{VERTICALS.map((v) => <option key={v}>{v}</option>)}</select></div>
      <div style={S.formGroup}><label style={S.label}>Estatus</label><select style={{ ...S.select, width: "100%" }} value={f.status} onChange={(e) => s("status", e.target.value)}>{PROSPECT_STATUS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>
      <div style={S.formGroup}><label style={S.label}><input type="checkbox" checked={f.coldSent} onChange={(e) => s("coldSent", e.target.checked)} style={{ marginRight: 8, accentColor: "#00ff41" }} />Cold Email Enviado</label></div>
      <div style={S.formGroup}><label style={S.label}>Último contacto</label><input type="date" style={S.input} value={f.lastContact} onChange={(e) => s("lastContact", e.target.value)} /></div>
      <div style={S.formGroup}><label style={S.label}>Notas</label><textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }} value={f.notes} onChange={(e) => s("notes", e.target.value)} /></div>
      <div style={S.actions}>
        {item && <button style={S.deleteBtn} onClick={() => onDelete(f.id)}>Eliminar</button>}
        <button style={S.cancelBtn} onClick={onClose}>Cancelar</button>
        <button style={S.saveBtn} onClick={() => onSave(f)}>Guardar</button>
      </div>
    </Modal>
  );
}

function EditorialForm({ item, onSave, onDelete, onClose }) {
  const [f, setF] = useState(item || { id: uid(), title: "", channel: CHANNELS[0], externalTarget: "", status: "idea", slug: "", notes: "", created: new Date().toISOString() });
  const s = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Editar Pieza" : "Nueva Pieza Editorial"} onClose={onClose}>
      <div style={S.formGroup}><label style={S.label}>Título / Tema</label><input style={S.input} value={f.title} onChange={(e) => s("title", e.target.value)} /></div>
      <div style={S.formGroup}><label style={S.label}>Canal</label><select style={{ ...S.select, width: "100%" }} value={f.channel} onChange={(e) => s("channel", e.target.value)}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></div>
      {f.channel === "External Pitch" && (
        <div style={S.formGroup}><label style={S.label}>Target</label><select style={{ ...S.select, width: "100%" }} value={f.externalTarget} onChange={(e) => s("externalTarget", e.target.value)}><option value="">— Seleccionar —</option>{EXTERNAL_TARGETS.map((t) => <option key={t}>{t}</option>)}</select></div>
      )}
      <div style={S.formGroup}><label style={S.label}>Estatus</label><select style={{ ...S.select, width: "100%" }} value={f.status} onChange={(e) => s("status", e.target.value)}>{EDITORIAL_STATUS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>
      <div style={S.formGroup}><label style={S.label}>Slug / URL</label><input style={S.input} value={f.slug} onChange={(e) => s("slug", e.target.value)} /></div>
      <div style={S.formGroup}><label style={S.label}>Notas</label><textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }} value={f.notes} onChange={(e) => s("notes", e.target.value)} /></div>
      <div style={S.actions}>
        {item && <button style={S.deleteBtn} onClick={() => onDelete(f.id)}>Eliminar</button>}
        <button style={S.cancelBtn} onClick={onClose}>Cancelar</button>
        <button style={S.saveBtn} onClick={() => onSave(f)}>Guardar</button>
      </div>
    </Modal>
  );
}

function TargetForm({ item, onSave, onDelete, onClose }) {
  const [f, setF] = useState(item || { id: uid(), name: "", tier: "Tier 2", rate: "", vertical: "Tech", url: "", source: "Research", pitched: false, status: "new", notes: "" });
  const s = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Editar Target" : "Nuevo Pitch Target"} onClose={onClose}>
      <div style={S.formGroup}><label style={S.label}>Publicación / Medio</label><input style={S.input} value={f.name} onChange={(e) => s("name", e.target.value)} placeholder="Ej: WIRED, Vogue Business" /></div>
      <div style={S.formGroup}><label style={S.label}>Tier</label><select style={{ ...S.select, width: "100%" }} value={f.tier} onChange={(e) => s("tier", e.target.value)}>{TARGET_TIERS.map((t) => <option key={t}>{t}</option>)}</select></div>
      <div style={S.formGroup}><label style={S.label}>Rate</label><input style={S.input} value={f.rate} onChange={(e) => s("rate", e.target.value)} placeholder="Ej: $0.75/word, $675/article" /></div>
      <div style={S.formGroup}><label style={S.label}>Vertical</label><select style={{ ...S.select, width: "100%" }} value={f.vertical} onChange={(e) => s("vertical", e.target.value)}>{TARGET_VERTICALS.map((v) => <option key={v}>{v}</option>)}</select></div>
      <div style={S.formGroup}><label style={S.label}>URL</label><input style={S.input} value={f.url} onChange={(e) => s("url", e.target.value)} /></div>
      <div style={S.formGroup}><label style={S.label}>Fuente del lead</label><select style={{ ...S.select, width: "100%" }} value={f.source} onChange={(e) => s("source", e.target.value)}>{TARGET_SOURCES.map((x) => <option key={x}>{x}</option>)}</select></div>
      <div style={S.formGroup}><label style={S.label}>Estatus</label><select style={{ ...S.select, width: "100%" }} value={f.status} onChange={(e) => s("status", e.target.value)}>{TARGET_STATUS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>
      <div style={S.formGroup}><label style={S.label}><input type="checkbox" checked={f.pitched} onChange={(e) => s("pitched", e.target.checked)} style={{ marginRight: 8, accentColor: "#00ff41" }} />Ya se pitcheó</label></div>
      <div style={S.formGroup}><label style={S.label}>Notas</label><textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }} value={f.notes} onChange={(e) => s("notes", e.target.value)} /></div>
      <div style={S.actions}>
        {item && <button style={S.deleteBtn} onClick={() => onDelete(f.id)}>Eliminar</button>}
        <button style={S.cancelBtn} onClick={onClose}>Cancelar</button>
        <button style={S.saveBtn} onClick={() => onSave(f)}>Guardar</button>
      </div>
    </Modal>
  );
}

// ─── Export to JSON ───
function exportJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `command-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main ───
export default function CommandCenter() {
  const [view, setView] = useState("prospecting");
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVertical, setFilterVertical] = useState("all");
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [filterSource, setFilterSource] = useState("all");

  useEffect(() => {
    const saved = loadData();
    if (saved) setData(saved);
    setLoaded(true);
  }, []);

  const persist = useCallback((d) => {
    setData(d);
    saveData(d);
  }, []);

  const crudFor = (key) => ({
    save: (item) => {
      const exists = data[key].find((x) => x.id === item.id);
      const list = exists ? data[key].map((x) => (x.id === item.id ? item : x)) : [...data[key], item];
      persist({ ...data, [key]: list });
      setEditing(null);
    },
    del: (id) => { persist({ ...data, [key]: data[key].filter((x) => x.id !== id) }); setEditing(null); },
  });

  const pCrud = crudFor("prospects");
  const eCrud = crudFor("editorial");
  const tCrud = crudFor("targets");

  if (!loaded) return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: font, color: "#00ff41", fontSize: 13, letterSpacing: "2px" }}>CARGANDO...</div>
    </div>
  );

  const filteredP = data.prospects.filter((p) => (filterStatus === "all" || p.status === filterStatus) && (filterVertical === "all" || p.vertical === filterVertical));
  const filteredE = data.editorial.filter((e) => (filterStatus === "all" || e.status === filterStatus) && (filterChannel === "all" || e.channel === filterChannel));
  const filteredT = data.targets.filter((t) => (filterStatus === "all" || t.status === filterStatus) && (filterTier === "all" || t.tier === filterTier) && (filterSource === "all" || t.source === filterSource));

  const pStats = { total: data.prospects.length, cold: data.prospects.filter((p) => p.coldSent).length, active: data.prospects.filter((p) => !["dead", "client"].includes(p.status)).length, clients: data.prospects.filter((p) => p.status === "client").length };
  const eStats = { total: data.editorial.length, ideas: data.editorial.filter((e) => e.status === "idea").length, wip: data.editorial.filter((e) => ["draft", "editing"].includes(e.status)).length, pub: data.editorial.filter((e) => ["published", "distributed"].includes(e.status)).length };
  const tStats = { total: data.targets.length, t1: data.targets.filter((t) => t.tier === "Tier 1").length, pitched: data.targets.filter((t) => t.pitched).length, active: data.targets.filter((t) => t.status === "active").length };

  const switchView = (v) => { setView(v); setFilterStatus("all"); setFilterVertical("all"); setFilterChannel("all"); setFilterTier("all"); setFilterSource("all"); setEditing(null); };

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={S.header}>
        <div>
          <div style={S.logo}>⌘ Command Center</div>
          <div style={S.subtitle}>Andrés Cerón · Prospecting, Editorial & Pitch Targets</div>
        </div>
        <button style={S.exportBtn} onClick={() => exportJSON(data)}>↓ Backup JSON</button>
      </div>

      <div style={S.tabs}>
        <button style={S.tab(view === "prospecting")} onClick={() => switchView("prospecting")}>◆ Prospecting ({data.prospects.length})</button>
        <button style={S.tab(view === "editorial")} onClick={() => switchView("editorial")}>◇ Editorial ({data.editorial.length})</button>
        <button style={S.tab(view === "targets")} onClick={() => switchView("targets")}>⊕ Pitch Targets ({data.targets.length})</button>
      </div>

      <div style={S.content}>

        {view === "prospecting" && (
          <>
            <div style={S.stats}>
              <div style={S.stat}><div style={S.statValue}>{pStats.total}</div><div style={S.statLabel}>Total</div></div>
              <div style={S.stat}><div style={S.statValue}>{pStats.cold}</div><div style={S.statLabel}>Cold Sent</div></div>
              <div style={S.stat}><div style={S.statValue}>{pStats.active}</div><div style={S.statLabel}>Activos</div></div>
              <div style={S.stat}><div style={{ ...S.statValue, color: pStats.clients > 0 ? "#00ff41" : "#333" }}>{pStats.clients}</div><div style={S.statLabel}>Clientes</div></div>
            </div>
            <div style={S.toolbar}>
              <div style={S.filterBar}>
                <button style={S.filterBtn(filterStatus === "all")} onClick={() => setFilterStatus("all")}>Todos</button>
                {PROSPECT_STATUS.map((x) => <button key={x.value} style={S.filterBtn(filterStatus === x.value)} onClick={() => setFilterStatus(x.value)}>{x.label}</button>)}
                <span style={{ color: "#222", margin: "0 4px" }}>|</span>
                <button style={S.filterBtn(filterVertical === "all")} onClick={() => setFilterVertical("all")}>All</button>
                {VERTICALS.map((v) => <button key={v} style={S.filterBtn(filterVertical === v)} onClick={() => setFilterVertical(v)}>{v}</button>)}
              </div>
              <button style={S.addBtn} onClick={() => setEditing("new")}>+ Prospecto</button>
            </div>
            {filteredP.length === 0 ? (
              <div style={S.empty}>{data.prospects.length === 0 ? "Sin prospectos. Agrega el primero →" : "Sin resultados."}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead><tr><th style={S.th}>Nombre</th><th style={S.th}>Empresa</th><th style={S.th}>Vertical</th><th style={S.th}>Estatus</th><th style={S.th}>Cold</th><th style={S.th}>Último</th><th style={S.th}>Notas</th></tr></thead>
                  <tbody>
                    {filteredP.map((p, i) => (
                      <tr key={p.id} style={S.row(i)} onClick={() => setEditing(p)} onMouseEnter={(e) => e.currentTarget.style.background = "#111"} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#0d0d0d"}>
                        <td style={{ ...S.td, fontWeight: 600, color: "#fff" }}>{p.name || "—"}</td>
                        <td style={S.td}>{p.company || "—"}</td>
                        <td style={S.td}><span style={{ fontFamily: font, fontSize: 10, color: "#888" }}>{p.vertical}</span></td>
                        <td style={S.td}><StatusBadge value={p.status} options={PROSPECT_STATUS} /></td>
                        <td style={S.td}><span style={{ color: p.coldSent ? "#00ff41" : "#333", fontFamily: font }}>{p.coldSent ? "✓" : "—"}</span></td>
                        <td style={{ ...S.td, fontFamily: font, fontSize: 11, color: "#888" }}>{formatDate(p.lastContact)}</td>
                        <td style={{ ...S.td, fontSize: 12, color: "#666", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {editing && <ProspectForm item={editing === "new" ? null : editing} onSave={pCrud.save} onDelete={pCrud.del} onClose={() => setEditing(null)} />}
          </>
        )}

        {view === "editorial" && (
          <>
            <div style={S.stats}>
              <div style={S.stat}><div style={S.statValue}>{eStats.total}</div><div style={S.statLabel}>Total</div></div>
              <div style={S.stat}><div style={S.statValue}>{eStats.ideas}</div><div style={S.statLabel}>Ideas</div></div>
              <div style={S.stat}><div style={S.statValue}>{eStats.wip}</div><div style={S.statLabel}>En Progreso</div></div>
              <div style={S.stat}><div style={{ ...S.statValue, color: eStats.pub > 0 ? "#00ff41" : "#333" }}>{eStats.pub}</div><div style={S.statLabel}>Publicados</div></div>
            </div>
            <div style={S.toolbar}>
              <div style={S.filterBar}>
                <button style={S.filterBtn(filterStatus === "all")} onClick={() => setFilterStatus("all")}>Todos</button>
                {EDITORIAL_STATUS.map((x) => <button key={x.value} style={S.filterBtn(filterStatus === x.value)} onClick={() => setFilterStatus(x.value)}>{x.label}</button>)}
                <span style={{ color: "#222", margin: "0 4px" }}>|</span>
                <button style={S.filterBtn(filterChannel === "all")} onClick={() => setFilterChannel("all")}>All</button>
                {CHANNELS.map((c) => <button key={c} style={S.filterBtn(filterChannel === c)} onClick={() => setFilterChannel(c)}>{c}</button>)}
              </div>
              <button style={S.addBtn} onClick={() => setEditing("new")}>+ Pieza</button>
            </div>
            {filteredE.length === 0 ? (
              <div style={S.empty}>{data.editorial.length === 0 ? "Sin piezas editoriales. Agrega la primera →" : "Sin resultados."}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead><tr><th style={S.th}>Título</th><th style={S.th}>Canal</th><th style={S.th}>Target</th><th style={S.th}>Estatus</th><th style={S.th}>Creado</th><th style={S.th}>Notas</th></tr></thead>
                  <tbody>
                    {filteredE.map((e, i) => (
                      <tr key={e.id} style={S.row(i)} onClick={() => setEditing(e)} onMouseEnter={(ev) => ev.currentTarget.style.background = "#111"} onMouseLeave={(ev) => ev.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#0d0d0d"}>
                        <td style={{ ...S.td, fontWeight: 600, color: "#fff" }}>{e.title || "—"}</td>
                        <td style={S.td}><span style={{ fontFamily: font, fontSize: 10, color: "#888" }}>{e.channel}</span></td>
                        <td style={{ ...S.td, fontFamily: font, fontSize: 11, color: "#888" }}>{e.channel === "External Pitch" ? (e.externalTarget || "—") : "—"}</td>
                        <td style={S.td}><StatusBadge value={e.status} options={EDITORIAL_STATUS} /></td>
                        <td style={{ ...S.td, fontFamily: font, fontSize: 11, color: "#888" }}>{formatDate(e.created)}</td>
                        <td style={{ ...S.td, fontSize: 12, color: "#666", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {editing && <EditorialForm item={editing === "new" ? null : editing} onSave={eCrud.save} onDelete={eCrud.del} onClose={() => setEditing(null)} />}
          </>
        )}

        {view === "targets" && (
          <>
            <div style={S.stats}>
              <div style={S.stat}><div style={S.statValue}>{tStats.total}</div><div style={S.statLabel}>Medios</div></div>
              <div style={S.stat}><div style={S.statValue}>{tStats.t1}</div><div style={S.statLabel}>Tier 1</div></div>
              <div style={S.stat}><div style={S.statValue}>{tStats.pitched}</div><div style={S.statLabel}>Pitched</div></div>
              <div style={S.stat}><div style={{ ...S.statValue, color: tStats.active > 0 ? "#00ff41" : "#333" }}>{tStats.active}</div><div style={S.statLabel}>Activos</div></div>
            </div>
            <div style={S.toolbar}>
              <div style={S.filterBar}>
                <button style={S.filterBtn(filterStatus === "all")} onClick={() => setFilterStatus("all")}>Todos</button>
                {TARGET_STATUS.map((x) => <button key={x.value} style={S.filterBtn(filterStatus === x.value)} onClick={() => setFilterStatus(x.value)}>{x.label}</button>)}
                <span style={{ color: "#222", margin: "0 4px" }}>|</span>
                {TARGET_TIERS.map((t) => <button key={t} style={S.filterBtn(filterTier === t)} onClick={() => setFilterTier(filterTier === t ? "all" : t)}>{t}</button>)}
                <span style={{ color: "#222", margin: "0 4px" }}>|</span>
                {TARGET_SOURCES.slice(0, 4).map((x) => <button key={x} style={S.filterBtn(filterSource === x)} onClick={() => setFilterSource(filterSource === x ? "all" : x)}>{x}</button>)}
              </div>
              <button style={S.addBtn} onClick={() => setEditing("new")}>+ Target</button>
            </div>
            {filteredT.length === 0 ? (
              <div style={S.empty}>Sin resultados para este filtro.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead><tr><th style={S.th}>Medio</th><th style={S.th}>Tier</th><th style={S.th}>Rate</th><th style={S.th}>Vertical</th><th style={S.th}>Fuente</th><th style={S.th}>Estatus</th><th style={S.th}>Pitched</th><th style={S.th}>Notas</th></tr></thead>
                  <tbody>
                    {filteredT.map((t, i) => (
                      <tr key={t.id} style={S.row(i)} onClick={() => setEditing(t)} onMouseEnter={(e) => e.currentTarget.style.background = "#111"} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#0d0d0d"}>
                        <td style={{ ...S.td, fontWeight: 600, color: "#fff" }}>{t.name}</td>
                        <td style={S.td}><span style={S.tierBadge(t.tier)}>{t.tier}</span></td>
                        <td style={{ ...S.td, fontFamily: font, fontSize: 11, color: "#f59e0b" }}>{t.rate || "TBD"}</td>
                        <td style={S.td}><span style={{ fontFamily: font, fontSize: 10, color: "#888" }}>{t.vertical}</span></td>
                        <td style={{ ...S.td, fontFamily: font, fontSize: 10, color: "#666" }}>{t.source}</td>
                        <td style={S.td}><StatusBadge value={t.status} options={TARGET_STATUS} /></td>
                        <td style={S.td}><span style={{ color: t.pitched ? "#00ff41" : "#333", fontFamily: font }}>{t.pitched ? "✓" : "—"}</span></td>
                        <td style={{ ...S.td, fontSize: 12, color: "#666", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {editing && <TargetForm item={editing === "new" ? null : editing} onSave={tCrud.save} onDelete={tCrud.del} onClose={() => setEditing(null)} />}
          </>
        )}

      </div>
    </div>
  );
}
