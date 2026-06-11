import { COLORS } from "../constants";

const TABS = [
  ["registrar", "➕", "Registrar"],
  ["resumen", "📊", "Resumen"],
  ["historial", "📜", "Historial"],
];

export default function NavBar({ tab, setTab }) {
  return (
    <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 40 }}>
      {TABS.map(([t, icon, lbl]) => (
        <button key={t} onClick={() => setTab(t)}
          style={{ flex: 1, background: "none", border: "none", padding: "10px 0 14px", cursor: "pointer", color: tab === t ? COLORS.gold : COLORS.textDim, fontWeight: tab === t ? 700 : 500, fontSize: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 19 }}>{icon}</span>
          {lbl}
        </button>
      ))}
    </nav>
  );
}
