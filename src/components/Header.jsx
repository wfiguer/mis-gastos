import { COLORS } from "../constants";
import { etiquetaMes, mesSiguiente } from "../utils";

export default function Header({ tab, mes, setMes }) {
  const showNav = tab === "resumen" || tab === "historial";

  return (
    <header style={{ padding: "18px 20px 8px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.gold, fontWeight: 700, textTransform: "uppercase" }}>Mis cuentas</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Gastos & Ingresos</div>
      </div>

      {showNav && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => setMes(mesSiguiente(mes, -1))} aria-label="Mes anterior" style={{ background: "none", border: "none", color: COLORS.gold, fontSize: 20, cursor: "pointer", padding: "10px 14px", lineHeight: 1 }}>‹</button>
          <span style={{ fontSize: 13, color: COLORS.textDim, minWidth: 96, textAlign: "center" }}>{etiquetaMes(mes)}</span>
          <button onClick={() => setMes(mesSiguiente(mes, 1))} aria-label="Mes siguiente" style={{ background: "none", border: "none", color: COLORS.gold, fontSize: 20, cursor: "pointer", padding: "10px 14px", lineHeight: 1 }}>›</button>
        </div>
      )}
    </header>
  );
}
