import { useState, useEffect, useCallback } from "react";
import { COLORS } from "./constants";
import { hoyISO, mesActual, mesDeFecha, labelCategoria } from "./utils";
import { cargarMes, guardarMes, probarAlmacen } from "./storage";
import Header from "./components/Header";
import FormRegistrar from "./components/FormRegistrar";
import Resumen from "./components/Resumen";
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
  const [toast, setToast] = useState(null);
  const [errorDetalle, setErrorDetalle] = useState(null);
  const [almacenDisponible, setAlmacenDisponible] = useState(null);

  useEffect(() => {
    setAlmacenDisponible(probarAlmacen());
  }, []);

  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [categoria, setCategoria] = useState(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [nota, setNota] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoMes, setEditandoMes] = useState(null);
  const [csvVisible, setCsvVisible] = useState(null);

  const refrescar = useCallback((m) => {
    setCargando(true);
    setItems(cargarMes(m));
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

  const guardarMovimiento = () => {
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
    const lista = mesDestino === mes ? [...items] : cargarMes(mesDestino);
    const sinAnterior = lista.filter((x) => x.id !== mov.id);
    sinAnterior.push(mov);
    sinAnterior.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    if (mesDestino === mes) setItems(sinAnterior);

    if (almacenDisponible !== false) {
      try {
        if (editandoId && editandoMes && editandoMes !== mesDestino) {
          const origen = cargarMes(editandoMes);
          guardarMes(editandoMes, origen.filter((x) => x.id !== editandoId));
        }
        guardarMes(mesDestino, sinAnterior);
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

  const eliminar = (id) => {
    const nuevos = items.filter((x) => x.id !== id);
    setItems(nuevos);
    if (almacenDisponible !== false) {
      try {
        guardarMes(mes, nuevos);
        avisar("Eliminado");
      } catch (e) {
        setAlmacenDisponible(false);
        avisar("Eliminado solo en esta sesión ⚠️");
      }
    } else {
      avisar("Eliminado solo en esta sesión ⚠️");
    }
  };

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

  const tecla = (t) => {
    if (t === "borrar") { setMonto((m) => m.slice(0, -1)); return; }
    if (monto.length >= 10) return;
    if (t === "000" && monto === "") return;
    setMonto((m) => (m === "0" ? t : m + t));
  };

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

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Space Grotesk', system-ui, sans-serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
      <Header tab={tab} mes={mes} setMes={setMes} />

      {almacenDisponible === false && (
        <div style={{ margin: "0 20px 4px", background: "#3A2A1A", border: `1px solid ${COLORS.expense}`, borderRadius: 10, padding: "8px 12px", fontSize: 12, color: COLORS.text, lineHeight: 1.4 }}>
          ⚠️ El almacenamiento permanente no responde. Puedes registrar, pero los datos solo durarán esta sesión. <strong>Exporta a CSV antes de cerrar</strong> para no perderlos.
        </div>
      )}

      <main style={{ flex: 1, padding: "8px 20px 90px", overflowY: "auto" }}>
        {tab === "registrar" && (
          <FormRegistrar
            editandoId={editandoId}
            limpiarFormulario={limpiarFormulario}
            tipo={tipo}
            setTipo={setTipo}
            setCategoria={setCategoria}
            setMonto={setMonto}
            monto={monto}
            categoria={categoria}
            fecha={fecha}
            setFecha={setFecha}
            nota={nota}
            setNota={setNota}
            guardarMovimiento={guardarMovimiento}
            tecla={tecla}
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
      <NavBar tab={tab} setTab={setTab} />
    </div>
  );
}
