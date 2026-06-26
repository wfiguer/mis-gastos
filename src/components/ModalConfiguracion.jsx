import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants";

const inputStyle = {
  width: "100%",
  background: COLORS.surfaceHi,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function ModalConfiguracion({ visible, onClose }) {
  const [vista, setVista] = useState("menu");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok"|"error", texto }
  const [guardando, setGuardando] = useState(false);

  if (!visible) return null;

  const cerrar = () => {
    setVista("menu");
    setNuevaPassword("");
    setConfirmarPassword("");
    setMensaje(null);
    setMostrarNueva(false);
    setMostrarConfirmar(false);
    onClose();
  };

  const volver = () => {
    setVista("menu");
    setNuevaPassword("");
    setConfirmarPassword("");
    setMensaje(null);
    setMostrarNueva(false);
    setMostrarConfirmar(false);
  };

  const guardarPassword = async () => {
    setMensaje(null);
    if (!nuevaPassword || !confirmarPassword) {
      setMensaje({ tipo: "error", texto: "Completa ambos campos" });
      return;
    }
    if (nuevaPassword.length < 6) {
      setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden" });
      return;
    }

    setGuardando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
      if (error) throw error;
      setMensaje({ tipo: "ok", texto: "Contraseña actualizada ✓" });
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (e) {
      setMensaje({ tipo: "error", texto: e.message ?? "No se pudo actualizar la contraseña" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 60 }}>
      <div style={{ background: COLORS.surface, borderRadius: 16, padding: 20, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 12 }}>

        {vista === "menu" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Configuración</div>

            <button
              onClick={() => setVista("cambiar-password")}
              style={{ background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 12, padding: "14px 16px", fontSize: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              🔑 Cambiar contraseña
            </button>

            <button
              onClick={cerrar}
              style={{ background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}`, color: COLORS.textDim, borderRadius: 12, padding: "12px 0", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Cerrar
            </button>
          </>
        )}

        {vista === "cambiar-password" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Cambiar contraseña</div>

            {/* Nueva contraseña */}
            <div style={{ position: "relative" }}>
              <input
                type={mostrarNueva ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                onClick={() => setMostrarNueva((v) => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: COLORS.textDim, padding: "4px" }}>
                {mostrarNueva ? "🙈" : "👁"}
              </button>
            </div>

            {/* Confirmar contraseña */}
            <div style={{ position: "relative" }}>
              <input
                type={mostrarConfirmar ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                onClick={() => setMostrarConfirmar((v) => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: COLORS.textDim, padding: "4px" }}>
                {mostrarConfirmar ? "🙈" : "👁"}
              </button>
            </div>

            {/* Mensaje de error o éxito */}
            {mensaje && (
              <div style={{
                background: mensaje.tipo === "ok" ? "#1A3A1A" : "#3A1A1A",
                border: `1px solid ${mensaje.tipo === "ok" ? COLORS.income : COLORS.expense}`,
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 13,
                color: mensaje.tipo === "ok" ? COLORS.income : COLORS.expense,
              }}>
                {mensaje.texto}
              </div>
            )}

            <button
              onClick={guardarPassword}
              disabled={guardando}
              style={{ background: COLORS.gold, color: "#101714", borderRadius: 12, padding: "13px 0", fontSize: 15, fontWeight: 700, cursor: guardando ? "not-allowed" : "pointer", border: "none", fontFamily: "inherit", opacity: guardando ? 0.7 : 1 }}>
              {guardando ? "Guardando…" : "Guardar contraseña"}
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={volver}
                style={{ flex: 1, background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textDim, borderRadius: 12, padding: "11px 0", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                ← Volver
              </button>
              <button
                onClick={cerrar}
                style={{ flex: 1, background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}`, color: COLORS.textDim, borderRadius: 12, padding: "11px 0", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Cerrar
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
