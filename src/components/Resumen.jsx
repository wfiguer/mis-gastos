import { COLORS } from "../constants";
import { formatoPesos, iconoCategoria, labelCategoria } from "../utils";

export default function Resumen({ cargando, balance, totalIngresos, totalGastos, porCategoria, exportarCSV }) {
  if (cargando) return <div style={{ textAlign: "center", color: COLORS.textDim, padding: 40 }}>Cargando…</div>;

  return (
    <div>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 18, marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 12, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Balance del mes</div>
        <div style={{ fontSize: 36, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: balance >= 0 ? COLORS.income : COLORS.expense }}>
          {balance < 0 ? "−" : ""}$ {formatoPesos(Math.abs(balance))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12, fontSize: 14 }}>
          <div>
            <div style={{ color: COLORS.income, fontWeight: 700 }}>↑ $ {formatoPesos(totalIngresos)}</div>
            <div style={{ color: COLORS.textDim, fontSize: 12 }}>Ingresos</div>
          </div>
          <div>
            <div style={{ color: COLORS.expense, fontWeight: 700 }}>↓ $ {formatoPesos(totalGastos)}</div>
            <div style={{ color: COLORS.textDim, fontSize: 12 }}>Gastos</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 8 }}>Gastos por categoría</div>
      {porCategoria("gasto").length === 0 && (
        <div style={{ color: COLORS.textDim, fontSize: 14, padding: "10px 0 20px" }}>
          Sin gastos registrados este mes. Pasa a "Registrar" para agregar el primero.
        </div>
      )}
      {porCategoria("gasto").map(([cat, val]) => (
        <div key={cat} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 3 }}>
            <span>{iconoCategoria("gasto", cat)} {labelCategoria("gasto", cat)}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>$ {formatoPesos(val)}</span>
          </div>
          <div style={{ background: COLORS.surface, borderRadius: 6, height: 8 }}>
            <div style={{ width: `${totalGastos ? Math.max(4, (val / totalGastos) * 100) : 0}%`, background: COLORS.expense, height: 8, borderRadius: 6 }} />
          </div>
        </div>
      ))}

      {porCategoria("ingreso").length > 0 && (
        <>
          <div style={{ fontSize: 13, color: COLORS.textDim, margin: "18px 0 8px" }}>Ingresos por fuente</div>
          {porCategoria("ingreso").map(([cat, val]) => (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 3 }}>
                <span>{iconoCategoria("ingreso", cat)} {labelCategoria("ingreso", cat)}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>$ {formatoPesos(val)}</span>
              </div>
              <div style={{ background: COLORS.surface, borderRadius: 6, height: 8 }}>
                <div style={{ width: `${totalIngresos ? Math.max(4, (val / totalIngresos) * 100) : 0}%`, background: COLORS.income, height: 8, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </>
      )}

      <button onClick={exportarCSV}
        style={{ width: "100%", marginTop: 18, background: COLORS.surface, color: COLORS.gold, border: `1px solid ${COLORS.gold}`, borderRadius: 14, padding: "13px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        📋 Exportar mes a CSV
      </button>
    </div>
  );
}
