import { useState } from "react";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants";

// Traduce los mensajes de error de Supabase al español
const traducirError = (msg) => {
  if (msg.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (msg.includes("User already registered")) return "Ya existe una cuenta con ese correo.";
  if (msg.includes("Password should be at least 6 characters")) return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("Unable to validate email address")) return "El correo no tiene un formato válido.";
  if (msg.includes("Email not confirmed")) return "Confirmá tu correo antes de ingresar.";
  if (msg.includes("rate limit")) return "Demasiados intentos. Esperá un momento.";
  return "Ocurrió un error. Intentá de nuevo.";
};

export default function AuthScreen() {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const cambiarModo = (m) => {
    setModo(m);
    setError(null);
    setExito(null);
  };

  const enviar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setExito(null);

    if (modo === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traducirError(error.message));
      // Si no hay error, App.jsx detecta el cambio de sesión y muestra GastosApp
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(traducirError(error.message));
      else setExito("Cuenta creada. Ya podés ingresar con tus datos.");
    }

    setCargando(false);
  };

  const inputStyle = {
    width: "100%", background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}`,
    color: COLORS.text, borderRadius: 12, padding: "12px 14px", fontSize: 15,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", fontFamily: "'Space Grotesk', system-ui, sans-serif", color: COLORS.text }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Mis cuentas</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>Gastos & Ingresos</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[["login", "Iniciar sesión"], ["registro", "Crear cuenta"]].map(([m, lbl]) => (
            <button key={m} onClick={() => cambiarModo(m)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none",
                background: modo === m ? COLORS.gold : COLORS.surface,
                color: modo === m ? COLORS.goldDark : COLORS.textDim }}>
              {lbl}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email" placeholder="Correo electrónico"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email" style={inputStyle}
          />
          <input
            type="password" placeholder="Contraseña"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required autoComplete={modo === "login" ? "current-password" : "new-password"} style={inputStyle}
          />

          {error && (
            <div style={{ background: "#3A1A1A", border: `1px solid ${COLORS.expense}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, color: COLORS.expense }}>
              {error}
            </div>
          )}
          {exito && (
            <div style={{ background: "#1A3A1A", border: `1px solid ${COLORS.income}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, color: COLORS.income }}>
              {exito}
            </div>
          )}

          <button type="submit" disabled={cargando}
            style={{ background: COLORS.gold, color: COLORS.goldDark, border: "none", borderRadius: 14, padding: "15px 0", fontSize: 16, fontWeight: 700, cursor: cargando ? "not-allowed" : "pointer", opacity: cargando ? 0.7 : 1, marginTop: 4 }}>
            {cargando ? "Cargando…" : modo === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
