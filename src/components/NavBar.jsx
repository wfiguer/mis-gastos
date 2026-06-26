import { useState } from "react";
import { COLORS } from "../constants";

const TABS = [
  ["registrar", "➕", "Registrar"],
  ["resumen", "📊", "Resumen Mensual"],
  ["resumen-anual", "📅", "Resumen Anual"],
  ["historial", "📜", "Historial"],
];

export default function NavBar({ tab, setTab, onSignOut }) {
  const [confirmar, setConfirmar] = useState(false);

  const handleSalir = () => setConfirmar(true);
  const handleCancelar = () => setConfirmar(false);
  const handleConfirmar = () => { setConfirmar(false); onSignOut(); };

  return (
    <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, zIndex: 40 }}>
      <div style={{ display: "flex" }}>
        {TABS.map(([t, icon, lbl]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, background: "none", border: "none", padding: "10px 0 12px", cursor: "pointer", color: tab === t ? COLORS.gold : COLORS.textDim, fontWeight: tab === t ? 700 : 500, fontSize: 11, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 19 }}>{icon}</span>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "7px 20px", display: "flex", alignItems: "center", justifyContent: confirmar ? "space-between" : "flex-end" }}>
        {confirmar ? (
          <>
            <span style={{ fontSize: 13, color: COLORS.textDim }}>¿Confirmar salida?</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCancelar}
                style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textDim, borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button onClick={handleConfirmar}
                style={{ background: "none", border: `1px solid ${COLORS.expense}`, color: COLORS.expense, borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Salir
              </button>
            </div>
          </>
        ) : (
          <button onClick={handleSalir}
            style={{ background: "none", border: "none", color: COLORS.textDim, fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: "2px 0" }}>
            Salir →
          </button>
        )}
      </div>
    </nav>
  );
}
