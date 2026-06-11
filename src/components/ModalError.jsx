import { COLORS } from "../constants";

export default function ModalError({ errorDetalle, setErrorDetalle }) {
  if (!errorDetalle) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 70 }}>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.expense}`, borderRadius: 16, padding: 16, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontWeight: 700, color: COLORS.expense }}>No se pudo guardar</div>
        <div style={{ fontSize: 13, color: COLORS.textDim }}>Este es el mensaje completo del error. Cópialo o tómale captura y compártelo con Claude:</div>
        <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 10, fontSize: 13, fontFamily: "monospace", wordBreak: "break-word", maxHeight: "40vh", overflowY: "auto" }}>
          {errorDetalle}
        </div>
        <button onClick={() => setErrorDetalle(null)} style={{ background: COLORS.gold, color: COLORS.goldDark, border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}
