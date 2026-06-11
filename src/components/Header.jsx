import { COLORS } from "../constants";
import { etiquetaMes, mesSiguiente } from "../utils";

export default function Header({ tab, mes, setMes }) {
  return (
    <header style={{ padding: "18px 20px 8px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.gold, fontWeight: 700, textTransform: "uppercase" }}>Mis cuentas</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Gastos & Ingresos</div>
      </div>
      {tab !== "registrar" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setMes(mesSiguiente(mes, -1))} aria-label="Mes anterior" style={{ background: "none", border: "none", color: COLORS.gold, fontSize: 20, cursor: "pointer" }}>‹</button>
          <span style={{ fontSize: 13, color: COLORS.textDim, minWidth: 96, textAlign: "center" }}>{etiquetaMes(mes)}</span>
          <button onClick={() => setMes(mesSiguiente(mes, 1))} aria-label="Mes siguiente" style={{ background: "none", border: "none", color: COLORS.gold, fontSize: 20, cursor: "pointer" }}>›</button>
        </div>
      )}
    </header>
  );
}
