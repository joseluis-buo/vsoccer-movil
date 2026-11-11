import { peticion } from './cliente';

// Endpoints del modo Familia. Los tipos copian lo que responde la API
// (serializers del proyecto viva_soccer).

/** Una evaluación del histórico. El promedio lo calcula el servidor. */
export type Evaluacion = {
  id: number;
  fecha: string; // "2026-10-07", la fecha de la cancha
  temporada: number; // el año de la evaluación
  pase: number;
  recepcion: number;
  tiro: number;
  promedio: number;
  observaciones: string;
  capturada_por: string | null;
};

export type Hijo = {
  id: number;
  folio: string;
  nombre: string;
  categoria: string; // clave, p. ej. "MINI"
  horario: string; // clave, p. ej. "LUN_MIE"
  categoria_nombre: string;
  horario_nombre: string;
  activo: boolean; // false = dado de baja
  ultima_evaluacion: Evaluacion | null;
};

export type Historial = {
  alumno: { id: number; folio: string; nombre: string; categoria: string; horario: string };
  /** Vienen de la más vieja a la más nueva. */
  evaluaciones: Evaluacion[];
};

export type Comunicado = {
  id: number;
  titulo: string;
  cuerpo: string;
  categoria: string; // vacía = aviso para todas las categorías
  publicado: string; // fecha y hora ISO
};

export function pedirMisHijos() {
  return peticion<Hijo[]>('mis-hijos/');
}

export function pedirComunicados() {
  return peticion<Comunicado[]>('comunicados/');
}

// La gráfica de progresión (11) usa los mismos datos que la ficha (10). Para
// no pedirlos dos veces, el último histórico de cada alumno se queda en
// memoria (nunca en disco) mientras la app está abierta.
const historiales = new Map<number, Historial>();

export async function pedirHistorial(alumnoId: number) {
  const historial = await peticion<Historial>(`alumnos/${alumnoId}/evaluaciones/`);
  historiales.set(alumnoId, historial);
  return historial;
}

/** Usa el histórico que ya bajó la ficha; si no lo hay, lo pide. */
export function historialGuardadoOPedir(alumnoId: number) {
  const guardado = historiales.get(alumnoId);
  return guardado ? Promise.resolve(guardado) : pedirHistorial(alumnoId);
}

/** Al cerrar sesión: que la siguiente cuenta no vea datos de otra familia. */
export function olvidarHistoriales() {
  historiales.clear();
}
