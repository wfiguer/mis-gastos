import { COLORS, CATEGORIAS_GASTO, CATEGORIAS_INGRESO } from "../constants";
import { hoyISO, formatoPesos } from "../utils";

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "borrar"];

export default function FormRegistrar({
  editandoId, limpiarFormulario,
  tipo, setTipo, setCategoria, setMonto,
  monto, categoria, fecha, setFecha,
  nota, setNota, guardarMovimiento, tecla, guardando,
}) {
  const categoriasActivas = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;

  const btnCat = (activa) => ({
    background: activa ? COLORS.gold : COLORS.surface,
    color: activa ? COLORS.goldDark : COLORS.text,
    border: `1px solid ${activa ? COLORS.gold : COLORS.border}`,
    borderRadius: 14, padding: "10px 4px", fontSize: 13, fontWeight: 600,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer",
  });

  const estiloTecla = {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text,
    borderRadius: 14, fontSize: 24, fontWeight: 600, padding: "12px 0", cursor: "pointer",
  };

  return (
    <div>
      {editandoId && (
        <div style={{ background: COLORS.surfaceHi, borderRadius: 10, padding: "8px 12px", fontSize: 13, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>✏️ Editando movimiento</span>
          <button onClick={limpiarFormulario} style={{ background: "none", border: "none", color: COLORS.gold, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["gasto", "Gasto", COLORS.expense], ["ingreso", "Ingreso", COLORS.income]].map(([t, lbl, col]) => (
          <button key={t} onClick={() => { setTipo(t); setCategoria(null); setMonto(""); setNota(""); }}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer",
              background: tipo === t ? col : COLORS.surface,
              color: tipo === t ? COLORS.goldDark : COLORS.textDim,
              border: `1px solid ${tipo === t ? col : COLORS.border}`,
            }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "8px 0 14px" }}>
        <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 2 }}>Monto en pesos</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: monto ? (tipo === "ingreso" ? COLORS.income : COLORS.expense) : COLORS.textDim, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
          $ {formatoPesos(parseInt(monto || "0", 10))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
        {TECLAS.map((t) => (
          <button key={t} onClick={() => tecla(t)} style={estiloTecla} aria-label={t === "borrar" ? "Borrar" : t}>
            {t === "borrar" ? "⌫" : t}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 6 }}>Categoría</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
        {categoriasActivas.map((c) => (
          <button key={c.id} onClick={() => setCategoria(c.id)} style={btnCat(categoria === c.id)}>
            <span style={{ fontSize: 20 }}>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value || hoyISO())}
          style={{ flex: "0 0 45%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 12, padding: "10px 12px", fontSize: 14 }} />
        <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota (opcional)" maxLength={60}
          style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 12, padding: "10px 12px", fontSize: 14 }} />
      </div>

      <button onClick={guardarMovimiento} disabled={guardando}
        style={{ width: "100%", background: COLORS.gold, color: COLORS.goldDark, border: "none", borderRadius: 14, padding: "15px 0", fontSize: 17, fontWeight: 700, cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.7 : 1 }}>
        {guardando ? "Guardando…" : editandoId ? "Actualizar movimiento" : "Guardar movimiento"}
      </button>
    </div>
  );
}
