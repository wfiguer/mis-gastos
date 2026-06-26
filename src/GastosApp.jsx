import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { COLORS } from "./constants";
import { hoyISO, mesActual, mesDeFecha, labelCategoria, calcularTotales } from "./utils";
import { cargarMes, cargarHistorial, insertarMovimiento, actualizarMovimiento, eliminarMovimiento } from "./storage";
import Header from "./components/Header";
import FormRegistrar from "./components/FormRegistrar";
import Resumen from "./components/Resumen";
import ResumenAnual from "./components/ResumenAnual";
import Historial from "./components/Historial";
import NavBar from "./components/NavBar";
import Toast from "./components/Toast";
import ModalCSV from "./components/ModalCSV";
import ModalError from "./components/ModalError";

export default function GastosApp() {
  const [tab, setTab] = useState("registrar");
  const [mes, setMes] = useState(mesActual());
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorDetalle, setErrorDetalle] = useState(null);

  // Formulario
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [categoria, setCategoria] = useState(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [nota, setNota] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [csvVisible, setCsvVisible] = useState(null);
  const [historialAnual, setHistorialAnual] = useState([]);
  const [cargandoAnual, setCargandoAnual] = useState(false);

  // Carga los movimientos del mes desde Supabase
  const refrescar = useCallback(async (m) => {
    setCargando(true);
    try {
      const data = await cargarMes(m);
      setItems(data);
    } catch (e) {
      setErrorDetalle(e.message ?? "Error cargando movimientos. Verificá tu conexión.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    refrescar(mes);
  }, [mes, refrescar]);

  useEffect(() => {
    if (tab !== "resumen-anual") return;
    setCargandoAnual(true);
    cargarHistorial()
      .then(setHistorialAnual)
      .catch((e) => setErrorDetalle(e.message ?? "Error cargando historial."))
      .finally(() => setCargandoAnual(false));
  }, [tab]);

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
  };

  // ---------- Guardar movimiento ----------
  const guardarMovimiento = async () => {
    const valor = parseInt(monto || "0", 10);
    if (!valor) { avisar("Ingresa un monto"); return; }
    if (!categoria) { avisar("Elige una categoría"); return; }

    setGuardando(true);
    const campos = { fecha, tipo, categoria, monto: valor, nota: nota.trim() };

    try {
      if (editandoId) {
        await actualizarMovimiento(editandoId, campos);
        avisar("Movimiento actualizado ✓");
      } else {
        await insertarMovimiento(campos);
        avisar("Guardado ✓");
      }
      limpiarFormulario();
      await refrescar(mes);
    } catch (e) {
      setErrorDetalle(e.message ?? "No se pudo guardar. Verificá tu conexión.");
    } finally {
      setGuardando(false);
    }
  };

  // ---------- Eliminar ----------
  const eliminar = async (id) => {
    try {
      await eliminarMovimiento(id);
      await refrescar(mes);
      avisar("Eliminado");
    } catch (e) {
      setErrorDetalle(e.message ?? "No se pudo eliminar. Verificá tu conexión.");
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
    setTab("registrar");
  };

  // ---------- Exportar CSV ----------
  const exportarCSV = () => {
    if (items.length === 0) { avisar("No hay movimientos este mes"); return; }
    const filas = [["fecha", "tipo", "categoria", "monto", "nota"]];
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

  // ---------- Cambiar tab ----------
  const cambiarTab = (nuevaTab) => {
    if (nuevaTab === "resumen" || nuevaTab === "historial") {
      setMes(mesActual());
    }
    setTab(nuevaTab);
  };

  // ---------- Cerrar sesión ----------
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    // App.jsx detecta el cambio de sesión y muestra AuthScreen automáticamente
  };

  // ---------- Cálculos resumen ----------
  const { totalIngresos, totalGastos, balance } = calcularTotales(items);

  const porCategoria = (tipoFiltro) => {
    const mapa = {};
    items.filter((x) => x.tipo === tipoFiltro).forEach((x) => {
      mapa[x.categoria] = (mapa[x.categoria] || 0) + x.monto;
    });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Space Grotesk', system-ui, sans-serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
      <Header tab={tab} mes={mes} setMes={setMes} />

      <main style={{ flex: 1, padding: "8px 20px 120px", overflowY: "auto" }}>
        {tab === "registrar" && (
          <FormRegistrar
            editandoId={editandoId}
            limpiarFormulario={limpiarFormulario}
            tipo={tipo} setTipo={setTipo}
            setCategoria={setCategoria} setMonto={setMonto}
            monto={monto} categoria={categoria}
            fecha={fecha} setFecha={setFecha}
            nota={nota} setNota={setNota}
            guardarMovimiento={guardarMovimiento}
            tecla={tecla}
            guardando={guardando}
          />
        )}
        {tab === "resumen" && (
          <Resumen
            cargando={cargando}
            balance={balance}
            totalIngresos={totalIngresos}
            totalGastos={totalGastos}
            porCategoria={porCategoria}
            exportarCSV={exportarCSV}
          />
        )}
        {tab === "resumen-anual" && (
          <ResumenAnual
            cargando={cargandoAnual}
            historial={historialAnual}
          />
        )}
        {tab === "historial" && (
          <Historial
            cargando={cargando}
            items={items}
            mes={mes}
            editar={editar}
            eliminar={eliminar}
          />
        )}
      </main>

      <Toast toast={toast} />
      <ModalCSV csvVisible={csvVisible} setCsvVisible={setCsvVisible} mes={mes} copiarCSV={copiarCSV} />
      <ModalError errorDetalle={errorDetalle} setErrorDetalle={setErrorDetalle} />
      <NavBar tab={tab} setTab={cambiarTab} onSignOut={cerrarSesion} />
    </div>
  );
}
