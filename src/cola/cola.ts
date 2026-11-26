import type { NuevaEvaluacion } from '@/api/entrenador';

import { baseDeDatos } from './baseDeDatos';

// Cola de captura sin conexión (regla 2 de CLAUDE.md). Cada evaluación se
// escribe aquí ANTES de intentar mandarla al servidor, y solo se borra cuando
// el servidor confirma que la tiene. Si no hay señal, se queda esperando.
//
// Una fila por evaluación, identificada por su client_uuid: reenviarla no
// duplica, porque el servidor reconoce ese mismo uuid.

/**
 * pendiente: todavía no llega al servidor; se puede reintentar.
 * rechazada: el servidor dijo que no (ya evaluado hoy, fecha vieja…).
 *            Reintentarla daría lo mismo: el entrenador decide si descartarla.
 */
export type EstadoEnCola = 'pendiente' | 'rechazada';

export type EvaluacionEnCola = NuevaEvaluacion & {
  usuario: string; // quién la capturó (id del servidor)
  alumno_nombre: string; // para listarla en Sincronizar sin pedir nada a la API
  estado: EstadoEnCola;
  intentos: number;
  ultimo_error: string | null;
  creada: string; // fecha y hora del teléfono, ISO
};

// Las pantallas que muestran la cola (Inicio, Sincronizar, la lista de
// alumnos) se registran aquí para enterarse cuando cambia, aunque el cambio
// venga del envío automático y no de algo que tocó el entrenador.
const oyentes = new Set<() => void>();

/** Registra una función que se llama cada vez que cambia la cola. Regresa cómo darse de baja. */
export function alCambiarLaCola(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function avisarCambio() {
  oyentes.forEach((oyente) => oyente());
}

/**
 * Guarda (o vuelve a guardar) una evaluación como pendiente. Si el mismo
 * client_uuid ya estaba, se actualizan sus datos en lugar de duplicarla.
 */
export async function guardarEnCola(usuario: string, evaluacion: NuevaEvaluacion, alumnoNombre: string) {
  const db = await baseDeDatos();
  await db.runAsync(
    `INSERT INTO cola_evaluaciones
       (client_uuid, usuario, alumno, alumno_nombre, fecha, pase, recepcion, tiro, observaciones, creada)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(client_uuid) DO UPDATE SET
       pase = excluded.pase,
       recepcion = excluded.recepcion,
       tiro = excluded.tiro,
       observaciones = excluded.observaciones,
       estado = 'pendiente',
       ultimo_error = NULL`,
    evaluacion.client_uuid,
    usuario,
    evaluacion.alumno,
    alumnoNombre,
    evaluacion.fecha,
    evaluacion.pase,
    evaluacion.recepcion,
    evaluacion.tiro,
    evaluacion.observaciones,
    new Date().toISOString(),
  );
  avisarCambio();
}

/** Toda la cola de ESTE usuario, la más vieja primero. La de otros no se ve. */
export async function leerCola(usuario: string) {
  const db = await baseDeDatos();
  return db.getAllAsync<EvaluacionEnCola>(
    'SELECT * FROM cola_evaluaciones WHERE usuario = ? ORDER BY creada',
    usuario,
  );
}

/** Después de un intento fallido: suma el intento y guarda el motivo. */
export async function anotarIntento(clientUuid: string, estado: EstadoEnCola, error: string) {
  const db = await baseDeDatos();
  await db.runAsync(
    `UPDATE cola_evaluaciones
       SET intentos = intentos + 1, estado = ?, ultimo_error = ?
     WHERE client_uuid = ?`,
    estado,
    error,
    clientUuid,
  );
  avisarCambio();
}

/**
 * Saca una evaluación de la cola: porque el servidor ya la tiene, o porque el
 * entrenador descartó una rechazada. Solo puede sacar las suyas.
 */
export async function quitarDeCola(usuario: string, clientUuid: string) {
  const db = await baseDeDatos();
  await db.runAsync('DELETE FROM cola_evaluaciones WHERE client_uuid = ? AND usuario = ?', clientUuid, usuario);
  avisarCambio();
}
