import { useState, useEffect, useCallback } from "react";

// ---------- Constantes ----------
const COLORS = {
  bg: "#101714",
  surface: "#1A241F",
  surfaceHi: "#24322B",
  border: "#2E3D35",
  text: "#F2EFE8",
  textDim: "#9DABA2",
  gold: "#E8C468",
  goldDark: "#15201B",
  income: "#6FCF8E",
  expense: "#E8896B",
};

const CATEGORIAS_GASTO = [
  { id: "mercado", label: "Mercado", icon: "🛒" },
  { id: "transporte", label: "Transporte", icon: "⛽" },
  { id: "ninos", label: "Niños", icon: "👶" },
  { id: "vehiculos", label: "Vehículos", icon: "🔧" },
  { id: "ttx802", label: "TTX802", icon: "🚛" },
  { id: "casa", label: "Casa", icon: "🏠" },
  { id: "salud", label: "Salud", icon: "💊" },
  { id: "otros", label: "Otros", icon: "📦" },
];

const CATEGORIAS_INGRESO = [
  { id: "carpinteria", label: "Carpintería", icon: "🪚" },
  { id: "ttx802", label: "TTX802", icon: "🚛" },
  { id: "sueldo", label: "Sueldo", icon: "💼" },
  { id: "otros", label: "Otros", icon: "💰" },
];

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ---------- Utilidades ----------
const hoyISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const mesDeFecha = (fechaISO) => fechaISO.slice(0, 7);

const mesActual = () => hoyISO().slice(0, 7);

const formatoPesos = (n) => {
  if (!n) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const etiquetaMes = (mesISO) => {
  const [y, m] = mesISO.split("-");
  return `${MESES[parseInt(m, 10) - 1]} ${y}`;
};

const mesSiguiente = (mesISO, delta) => {
  const [y, m] = mesISO.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const claveMes = (mesISO) => `mov-${mesISO}`;
const claveMesAntigua = (mesISO) => `movimientos:${mesISO}`;

const iconoCategoria = (tipo, catId) => {
  const lista = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const c = lista.find((x) => x.id === catId);
  return c ? c.icon : "📦";
};

const labelCategoria = (tipo, catId) => {
  const lista = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const c = lista.find((x) => x.id === catId);
  return c ? c.label : catId;
};

// ---------- Almacenamiento ----------
let indiceMesesCache = null;

async function setConReintento(clave, valor) {
  try {
    await window.storage.set(clave, valor, false);
  } catch (e) {
    // Espera breve y reintenta una vez (por límite de frecuencia del almacenamiento)
    await new Promise((r) => setTimeout(r, 700));
    await window.storage.set(clave, valor, false);
  }
}

async function cargarMes(mesISO) {
  try {
    const res = await window.storage.get(claveMes(mesISO), false);
    return res && res.value ? JSON.parse(res.value) : [];
  } catch {
    // Intentar con el formato de clave anterior (migración)
    try {
      const res = await window.storage.get(claveMesAntigua(mesISO), false);
      return res && res.value ? JSON.parse(res.value) : [];
    } catch {
      return [];
    }
  }
}

async function guardarMes(mesISO, items) {
  await setConReintento(claveMes(mesISO), JSON.stringify(items));
  // Mantener índice de meses con datos (con caché para no consultar cada vez)
  try {
    if (indiceMesesCache === null) {
      try {
        const res = await window.storage.get("indice-meses", false);
        indiceMesesCache = res && res.value ? JSON.parse(res.value) : [];
      } catch {
        indiceMesesCache = [];
      }
    }
    if (items.length > 0 && !indiceMesesCache.includes(mesISO)) {
      indiceMesesCache.push(mesISO);
      indiceMesesCache.sort();
      await setConReintento("indice-meses", JSON.stringify(indiceMesesCache));
    }
  } catch {
    // índice no crítico
  }
}

// ---------- Componente principal ----------
export default function GastosApp() {
  const [tab, setTab] = useState("registrar");
  const [mes, setMes] = useState(mesActual());
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState(null);
  const [errorDetalle, setErrorDetalle] = useState(null);
  const [almacenDisponible, setAlmacenDisponible] = useState(null);

  // Prueba automática del almacenamiento al abrir
  useEffect(() => {
    (async () => {
      try {
        await window.storage.set("prueba-almacen", "ok", false);
        const r = await window.storage.get("prueba-almacen", false);
        setAlmacenDisponible(!!(r && r.value === "ok"));
      } catch (e) {
        setAlmacenDisponible(false);
        setErrorDetalle(String(e && e.message ? e.message : e));
      }
    })();
  }, []);

  // Formulario
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [categoria, setCategoria] = useState(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [nota, setNota] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoMes, setEditandoMes] = useState(null);

  const [csvVisible, setCsvVisible] = useState(null);

  const refrescar = useCallback(async (m) => {
    setCargando(true);
    const data = await cargarMes(m);
    setItems(data);
    setCargando(false);
  }, []);

  useEffect(() => {
    refrescar(mes);
  }, [mes, refrescar]);

  const avisar = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const limpiarFormulario = () => {
    setMonto("");
    setCategoria(null);
    setNota("");
    setFecha(hoyISO());
    setEditandoId(null);
    setEditandoMes(null);
  };

  // ---------- Guardar movimiento ----------
  const guardarMovimiento = async () => {
    const valor = parseInt(monto || "0", 10);
    if (!valor) { avisar("Ingresa un monto"); return; }
    if (!categoria) { avisar("Elige una categoría"); return; }

    const mov = {
      id: editandoId || `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      fecha,
      tipo,
      categoria,
      monto: valor,
      nota: nota.trim(),
    };

    const mesDestino = mesDeFecha(fecha);

    // 1. Actualizar siempre los datos en memoria (la app sigue funcionando aunque falle el almacenamiento)
    const lista = mesDestino === mes ? [...items] : await cargarMes(mesDestino);
    const sinAnterior = lista.filter((x) => x.id !== mov.id);
    sinAnterior.push(mov);
    sinAnterior.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    if (mesDestino === mes) setItems(sinAnterior);

    // 2. Intentar guardar de forma permanente
    if (almacenDisponible !== false) {
      try {
        if (editandoId && editandoMes && editandoMes !== mesDestino) {
          const origen = await cargarMes(editandoMes);
          await guardarMes(editandoMes, origen.filter((x) => x.id !== editandoId));
        }
        await guardarMes(mesDestino, sinAnterior);
        avisar(editandoId ? "Movimiento actualizado ✓" : "Guardado ✓");
      } catch (e) {
        setAlmacenDisponible(false);
        setErrorDetalle(String(e && e.message ? e.message : e));
        avisar("Guardado solo en esta sesión ⚠️");
      }
    } else {
      avisar("Guardado solo en esta sesión ⚠️");
    }
    limpiarFormulario();
  };

  // ---------- Eliminar ----------
  const eliminar = async (id) => {
    const nuevos = items.filter((x) => x.id !== id);
    setItems(nuevos);
    if (almacenDisponible !== false) {
      try {
        await guardarMes(mes, nuevos);
        avisar("Eliminado");
      } catch (e) {
        setAlmacenDisponible(false);
        avisar("Eliminado solo en esta sesión ⚠️");
      }
    } else {
      avisar("Eliminado solo en esta sesión ⚠️");
    }
  };

  // ---------- Editar ----------
  const editar = (mov) => {
    setMonto(String(mov.monto));
    setTipo(mov.tipo);
    setCategoria(mov.categoria);
    setFecha(mov.fecha);
    setNota(mov.nota || "");
    setEditandoId(mov.id);
    setEditandoMes(mesDeFecha(mov.fecha));
    setTab("registrar");
  };

  // ---------- Exportar ----------
  const exportarCSV = () => {
    if (items.length === 0) { avisar("No hay movimientos este mes"); return; }
    const filas = [["fecha","tipo","categoria","monto","nota"]];
    [...items].sort((a, b) => (a.fecha > b.fecha ? 1 : -1)).forEach((m) => {
      filas.push([m.fecha, m.tipo, labelCategoria(m.tipo, m.categoria), m.monto, (m.nota || "").replace(/[,\n]/g, " ")]);
    });
    setCsvVisible(filas.map((f) => f.join(",")).join("\n"));
  };

  const copiarCSV = async () => {
    try {
      await navigator.clipboard.writeText(csvVisible);
      avisar("Copiado ✓ — pégalo en el chat para generar el Excel");
    } catch {
      avisar("Selecciona el texto y cópialo manualmente");
    }
  };

  // ---------- Teclado numérico ----------
  const tecla = (t) => {
    if (t === "borrar") { setMonto((m) => m.slice(0, -1)); return; }
    if (monto.length >= 10) return;
    if (t === "000" && monto === "") return;
    setMonto((m) => (m === "0" ? t : m + t));
  };

  // ---------- Cálculos resumen ----------
  const totalIngresos = items.filter((x) => x.tipo === "ingreso").reduce((s, x) => s + x.monto, 0);
  const totalGastos = items.filter((x) => x.tipo === "gasto").reduce((s, x) => s + x.monto, 0);
  const balance = totalIngresos - totalGastos;

  const porCategoria = (tipoFiltro) => {
    const mapa = {};
    items.filter((x) => x.tipo === tipoFiltro).forEach((x) => {
      mapa[x.categoria] = (mapa[x.categoria] || 0) + x.monto;
    });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]);
  };

  const categoriasActivas = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;

  // ---------- Estilos base ----------
  const S = {
    app: {
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto",
    },
    btnCat: (activa) => ({
      background: activa ? COLORS.gold : COLORS.surface,
      color: activa ? COLORS.goldDark : COLORS.text,
      border: `1px solid ${activa ? COLORS.gold : COLORS.border}`,
      borderRadius: 14, padding: "10px 4px", fontSize: 13, fontWeight: 600,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer",
    }),
    teclaNum: {
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text,
      borderRadius: 14, fontSize: 24, fontWeight: 600, padding: "12px 0", cursor: "pointer",
    },
  };

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: ${COLORS.bg}; }
        button { font-family: inherit; }
        button:active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) { button:active { transform: none; } }
        input, textarea { font-family: inherit; }
      `}</style>

      {/* Encabezado */}
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

      {/* Aviso de almacenamiento no disponible */}
      {almacenDisponible === false && (
        <div style={{ margin: "0 20px 4px", background: "#3A2A1A", border: `1px solid ${COLORS.expense}`, borderRadius: 10, padding: "8px 12px", fontSize: 12, color: COLORS.text, lineHeight: 1.4 }}>
          ⚠️ El almacenamiento permanente no responde. Puedes registrar, pero los datos solo durarán esta sesión. <strong>Exporta a CSV antes de cerrar</strong> para no perderlos.
        </div>
      )}

      <main style={{ flex: 1, padding: "8px 20px 90px", overflowY: "auto" }}>

        {/* ============ REGISTRAR ============ */}
        {tab === "registrar" && (
          <div>
            {editandoId && (
              <div style={{ background: COLORS.surfaceHi, borderRadius: 10, padding: "8px 12px", fontSize: 13, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✏️ Editando movimiento</span>
                <button onClick={limpiarFormulario} style={{ background: "none", border: "none", color: COLORS.gold, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
              </div>
            )}

            {/* Selector tipo */}
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

            {/* Monto */}
            <div style={{ textAlign: "center", padding: "8px 0 14px" }}>
              <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 2 }}>Monto en pesos</div>
              <div style={{ fontSize: 44, fontWeight: 700, color: monto ? (tipo === "ingreso" ? COLORS.income : COLORS.expense) : COLORS.textDim, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                $ {formatoPesos(parseInt(monto || "0", 10))}
              </div>
            </div>

            {/* Teclado */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
              {["1","2","3","4","5","6","7","8","9","000","0","borrar"].map((t) => (
                <button key={t} onClick={() => tecla(t)} style={S.teclaNum} aria-label={t === "borrar" ? "Borrar" : t}>
                  {t === "borrar" ? "⌫" : t}
                </button>
              ))}
            </div>

            {/* Categorías */}
            <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 6 }}>Categoría</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
              {categoriasActivas.map((c) => (
                <button key={c.id} onClick={() => setCategoria(c.id)} style={S.btnCat(categoria === c.id)}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Fecha y nota */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value || hoyISO())}
                style={{ flex: "0 0 45%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 12, padding: "10px 12px", fontSize: 14 }} />
              <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota (opcional)" maxLength={60}
                style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 12, padding: "10px 12px", fontSize: 14 }} />
            </div>

            {/* Guardar */}
            <button onClick={guardarMovimiento}
              style={{ width: "100%", background: COLORS.gold, color: COLORS.goldDark, border: "none", borderRadius: 14, padding: "15px 0", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
              {editandoId ? "Actualizar movimiento" : "Guardar movimiento"}
            </button>
          </div>
        )}

        {/* ============ RESUMEN ============ */}
        {tab === "resumen" && (
          <div>
            {cargando ? (
              <div style={{ textAlign: "center", color: COLORS.textDim, padding: 40 }}>Cargando…</div>
            ) : (
              <>
                {/* Balance */}
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

                {/* Gastos por categoría */}
                <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 8 }}>Gastos por categoría</div>
                {porCategoria("gasto").length === 0 && (
                  <div style={{ color: COLORS.textDim, fontSize: 14, padding: "10px 0 20px" }}>Sin gastos registrados este mes. Pasa a "Registrar" para agregar el primero.</div>
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

                {/* Ingresos por categoría */}
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
              </>
            )}
          </div>
        )}

        {/* ============ HISTORIAL ============ */}
        {tab === "historial" && (
          <div>
            {cargando ? (
              <div style={{ textAlign: "center", color: COLORS.textDim, padding: 40 }}>Cargando…</div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: "center", color: COLORS.textDim, padding: 40, fontSize: 14 }}>
                No hay movimientos en {etiquetaMes(mes)}.<br />Usa las flechas ‹ › para cambiar de mes.
              </div>
            ) : (
              [...items].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).map((m) => (
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
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal CSV */}
      {csvVisible !== null && (
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
      )}

      {/* Panel de error persistente */}
      {errorDetalle && (
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
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 86, left: "50%", transform: "translateX(-50%)", background: COLORS.gold, color: COLORS.goldDark, borderRadius: 12, padding: "9px 18px", fontWeight: 700, fontSize: 14, zIndex: 60, whiteSpace: "nowrap", maxWidth: "90vw", overflow: "hidden", textOverflow: "ellipsis" }}>
          {toast}
        </div>
      )}

      {/* Navegación inferior */}
      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 40 }}>
        {[["registrar", "➕", "Registrar"], ["resumen", "📊", "Resumen"], ["historial", "📜", "Historial"]].map(([t, icon, lbl]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, background: "none", border: "none", padding: "10px 0 14px", cursor: "pointer", color: tab === t ? COLORS.gold : COLORS.textDim, fontWeight: tab === t ? 700 : 500, fontSize: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 19 }}>{icon}</span>
            {lbl}
          </button>
        ))}
      </nav>
    </div>
  );
}
