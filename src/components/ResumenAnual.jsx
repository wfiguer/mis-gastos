import { COLORS } from "../constants";
import { calcularTotales, etiquetaMes, formatoPesos } from "../utils";

export default function ResumenAnual({ cargando, historial }) {
  if (cargando) return <div style={{ textAlign: "center", color: COLORS.textDim, padding: 40 }}>Cargando…</div>;

  // Agrupa movimientos por mes (YYYY-MM) en el frontend
  const porMes = {};
  historial.forEach((mov) => {
    const mes = mov.fecha.slice(0, 7);
    if (!porMes[mes]) porMes[mes] = [];
    porMes[mes].push(mov);
  });

  const meses = Object.keys(porMes).sort((a, b) => b.localeCompare(a));

  if (meses.length === 0) {
    return <div style={{ color: COLORS.textDim, fontSize: 14, padding: "20px 0" }}>Sin movimientos registrados.</div>;
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 12 }}>Historial por mes</div>
      <div style={{ overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ textAlign: "left", padding: "8px 6px 8px 0", fontWeight: 600, color: COLORS.textDim }}>Mes</th>
              <th style={{ textAlign: "right", padding: "8px 6px", fontWeight: 600, color: COLORS.textDim }}>Ingresos</th>
              <th style={{ textAlign: "right", padding: "8px 6px", fontWeight: 600, color: COLORS.textDim }}>Gastos</th>
              <th style={{ textAlign: "right", padding: "8px 0 8px 6px", fontWeight: 600, color: COLORS.textDim }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((mes) => {
              const { totalIngresos, totalGastos, balance } = calcularTotales(porMes[mes]);
              return (
                <tr key={mes} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "11px 6px 11px 0", color: COLORS.text }}>{etiquetaMes(mes)}</td>
                  <td style={{ padding: "11px 6px", textAlign: "right", color: COLORS.income, fontVariantNumeric: "tabular-nums" }}>
                    $ {formatoPesos(totalIngresos)}
                  </td>
                  <td style={{ padding: "11px 6px", textAlign: "right", color: COLORS.expense, fontVariantNumeric: "tabular-nums" }}>
                    $ {formatoPesos(totalGastos)}
                  </td>
                  <td style={{ padding: "11px 0 11px 6px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: balance >= 0 ? COLORS.income : COLORS.expense }}>
                    {balance < 0 ? "−" : ""}$ {formatoPesos(Math.abs(balance))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
