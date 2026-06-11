import { CATEGORIAS_INGRESO, CATEGORIAS_GASTO, MESES } from "./constants";

export const hoyISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export const mesDeFecha = (fechaISO) => fechaISO.slice(0, 7);

export const mesActual = () => hoyISO().slice(0, 7);

export const formatoPesos = (n) => {
  if (!n) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const etiquetaMes = (mesISO) => {
  const [y, m] = mesISO.split("-");
  return `${MESES[parseInt(m, 10) - 1]} ${y}`;
};

export const mesSiguiente = (mesISO, delta) => {
  const [y, m] = mesISO.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const iconoCategoria = (tipo, catId) => {
  const lista = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const c = lista.find((x) => x.id === catId);
  return c ? c.icon : "📦";
};

export const labelCategoria = (tipo, catId) => {
  const lista = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const c = lista.find((x) => x.id === catId);
  return c ? c.label : catId;
};
