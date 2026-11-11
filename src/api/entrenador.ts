import { peticion } from './cliente';

// Endpoints del modo Entrenador. Los tipos copian lo que responde la API.

export type Grupo = {
  grupo: string; // clave, p. ej. "MINI-LUN_MIE"
  nombre: string; // p. ej. "Mini · Lunes y Miércoles"
  categoria: string;
  horario: string;
  alumnos: number; // alumnos activos del grupo
};

export type AlumnoDelGrupo = {
  id: number;
  folio: string;
  nombre: string;
  categoria: string;
  horario: string;
  evaluado_hoy: boolean;
  evaluacion_hoy: number | null; // id de la evaluación de hoy, para corregirla
};

/** Lo que el teléfono manda. Promedio y folio NO van: los calcula el servidor. */
export type NuevaEvaluacion = {
  client_uuid: string;
  alumno: number;
  fecha: string; // la del teléfono, "2026-11-11"
  pase: number;
  recepcion: number;
  tiro: number;
  observaciones: string;
};

/** Lo que responde el servidor al guardar (201 nueva, 200 si ya la tenía). */
export type EvaluacionGuardada = NuevaEvaluacion & {
  id: number;
  folio: string;
  alumno_nombre: string;
  promedio: number;
  capturada_por: string | null;
};

export const MAX_OBSERVACIONES = 500;

export function pedirMisGrupos() {
  return peticion<Grupo[]>('mis-grupos/');
}

export function pedirAlumnosDelGrupo(grupo: string) {
  return peticion<AlumnoDelGrupo[]>(`alumnos/?grupo=${encodeURIComponent(grupo)}`);
}

export function enviarEvaluacion(evaluacion: NuevaEvaluacion) {
  return peticion<EvaluacionGuardada>('evaluaciones/', { metodo: 'POST', cuerpo: evaluacion });
}
