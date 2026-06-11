import { COLORS } from "../constants";
import { etiquetaMes } from "../utils";

export default function ModalCSV({ csvVisible, setCsvVisible, mes, copiarCSV }) {
  if (csvVisible === null) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}>
      <div style={{ background: COLORS.surface, borderRadius: 16, padding: 16, width: "100%", maxWidth: 440, maxHeight: "80vh", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Datos de {etiquetaMes(mes)}</div>
        <div style={{ fontSize: 13, color: COLORS.textDim }}>Copia este texto y pégalo en el chat con Claude para generar tu Excel de respaldo en Drive.</div>
        <textarea readOnly value={csvVisible}
          style={{ flex: 1, minHeight: 160, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 10, fontSize: 12, fontFamily: "monospace", resize: "none" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copiarCSV} style={{ flex: 1, background: COLORS.gold, color: COLORS.goldDark, border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, cursor: "pointer" }}>Copiar</button>
          <button onClick={() => setCsvVisible(null)} style={{ flex: 1, background: COLORS.surfaceHi, color: COLORS.text, border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
