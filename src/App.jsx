import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { COLORS } from "./constants";
import AuthScreen from "./components/AuthScreen";
import GastosApp from "./GastosApp";

export default function App() {
  // undefined = todavía cargando la sesión guardada
  // null      = no hay sesión (mostrar login)
  // object    = hay sesión activa (mostrar la app)
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // Recupera la sesión persistida en localStorage (si el usuario ya había ingresado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escucha cualquier cambio de sesión: login, logout, token renovado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pantalla de carga mientras Supabase verifica si hay sesión guardada
  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', system-ui, sans-serif", color: COLORS.textDim, fontSize: 15 }}>
        Cargando…
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  return <GastosApp />;
}
