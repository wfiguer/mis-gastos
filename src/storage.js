const claveMes = (mesISO) => `mov-${mesISO}`;
const claveMesAntigua = (mesISO) => `movimientos:${mesISO}`;

let indiceMesesCache = null;

export function probarAlmacen() {
  try {
    localStorage.setItem("prueba-almacen", "ok");
    const ok = localStorage.getItem("prueba-almacen") === "ok";
    localStorage.removeItem("prueba-almacen");
    return ok;
  } catch {
    return false;
  }
}

export function cargarMes(mesISO) {
  try {
    const val = localStorage.getItem(claveMes(mesISO));
    if (val) return JSON.parse(val);
    // migración: intentar con clave anterior
    const viejo = localStorage.getItem(claveMesAntigua(mesISO));
    return viejo ? JSON.parse(viejo) : [];
  } catch {
    return [];
  }
}

export function guardarMes(mesISO, items) {
  localStorage.setItem(claveMes(mesISO), JSON.stringify(items));
  try {
    if (indiceMesesCache === null) {
      const raw = localStorage.getItem("indice-meses");
      indiceMesesCache = raw ? JSON.parse(raw) : [];
    }
    if (items.length > 0 && !indiceMesesCache.includes(mesISO)) {
      indiceMesesCache.push(mesISO);
      indiceMesesCache.sort();
      localStorage.setItem("indice-meses", JSON.stringify(indiceMesesCache));
    }
  } catch {
    // índice no crítico
  }
}
