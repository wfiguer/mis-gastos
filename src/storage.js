import { supabase } from "./lib/supabase";

// Primer día del mes siguiente (para el filtro de fecha)
const inicioMesSiguiente = (mesISO) => {
  const [y, m] = mesISO.split("-").map(Number);
  const d = new Date(y, m, 1); // new Date(año, mes_0_indexed + 1, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

export async function cargarMes(mesISO) {
  const { data, error } = await supabase
    .from("movimientos")
    .select("id, fecha, tipo, categoria, monto, nota")
    .gte("fecha", `${mesISO}-01`)
    .lt("fecha", inicioMesSiguiente(mesISO))
    .order("fecha", { ascending: false });

  if (error) throw error;
  // Normaliza nota: Supabase puede devolver null si el campo estaba vacío
  return (data ?? []).map((m) => ({ ...m, nota: m.nota ?? "" }));
}

// Inserta un movimiento nuevo. No enviamos id ni user_id: los genera la base de datos.
export async function insertarMovimiento({ fecha, tipo, categoria, monto, nota }) {
  const { error } = await supabase
    .from("movimientos")
    .insert({ fecha, tipo, categoria, monto, nota: nota || null });

  if (error) throw error;
}

// Actualiza un movimiento existente por su UUID.
export async function actualizarMovimiento(id, { fecha, tipo, categoria, monto, nota }) {
  const { error } = await supabase
    .from("movimientos")
    .update({ fecha, tipo, categoria, monto, nota: nota || null })
    .eq("id", id);

  if (error) throw error;
}

// Trae todos los movimientos históricos (fecha, tipo, monto) para el resumen anual.
// Una sola query; el frontend agrupa por mes.
export async function cargarHistorial() {
  const { data, error } = await supabase
    .from("movimientos")
    .select("fecha, tipo, monto")
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Elimina un movimiento por su UUID.
export async function eliminarMovimiento(id) {
  const { error } = await supabase
    .from("movimientos")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
