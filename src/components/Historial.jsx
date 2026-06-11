import { COLORS } from "../constants";
import { etiquetaMes, iconoCategoria, labelCategoria, formatoPesos } from "../utils";

export default function Historial({ cargando, items, mes, editar, eliminar }) {
  if (cargando) return <div style={{ textAlign: "center", color: COLORS.textDim, padding: 40 }}>Cargando…</div>;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", color: COLORS.textDim, padding: 40, fontSize: 14 }}>
        No hay movimientos en {etiquetaMes(mes)}.<br />Usa las flechas ‹ › para cambiar de mes.
      </div>
    );
  }

  return (
    <div>
      {[...items].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).map((m) => (
        <div key={m.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{iconoCategoria(m.tipo, m.categoria)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{labelCategoria(m.tipo, m.categoria)}</div>
            <div style={{ fontSize: 12, color: COLORS.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {m.fecha.slice(8, 10)}/{m.fecha.slice(5, 7)}{m.nota ? ` · ${m.nota}` : ""}
            </div>
          </div>
          <div style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: m.tipo === "ingreso" ? COLORS.income : COLORS.expense, fontSize: 15 }}>
            {m.tipo === "ingreso" ? "+" : "−"}$ {formatoPesos(m.monto)}
          </div>
          <button onClick={() => editar(m)} aria-label="Editar" style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer" }}>✏️</button>
          <button onClick={() => eliminar(m.id)} aria-label="Eliminar" style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer" }}>🗑️</button>
        </div>
      ))}
    </div>
  );
}
