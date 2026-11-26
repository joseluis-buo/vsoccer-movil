import * as SQLite from 'expo-sqlite';

import type { NuevaEvaluacion } from '@/api/entrenador';

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

const ESQUEMA = `
  CREATE TABLE IF NOT EXISTS cola_evaluaciones (
    client_uuid   TEXT PRIMARY KEY NOT NULL,
    usuario       TEXT NOT NULL,
    alumno        INTEGER NOT NULL,
    alumno_nombre TEXT NOT NULL,
    fecha         TEXT NOT NULL,
    pase          INTEGER NOT NULL,
    recepcion     INTEGER NOT NULL,
    tiro          INTEGER NOT NULL,
    observaciones TEXT NOT NULL DEFAULT '',
    estado        TEXT NOT NULL DEFAULT 'pendiente',
    intentos      INTEGER NOT NULL DEFAULT 0,
    ultimo_error  TEXT,
    creada        TEXT NOT NULL
  );
`;

// La base se abre una sola vez y todos comparten la misma conexión.
let conexion: Promise<SQLite.SQLiteDatabase> | null = null;

function baseDeDatos() {
  conexion ??= SQLite.openDatabaseAsync('vivasoccer.db')
    .then(async (db) => {
      await db.execAsync(ESQUEMA);
      return db;
    })
    .catch((error) => {
      // Si falla al abrir, el siguiente intento vuelve a probar.
      conexion = null;
      throw error;
    });
  return conexion;
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
}

/**
 * Saca una evaluación de la cola: porque el servidor ya la tiene, o porque el
 * entrenador descartó una rechazada. Solo puede sacar las suyas.
 */
export async function quitarDeCola(usuario: string, clientUuid: string) {
  const db = await baseDeDatos();
  await db.runAsync('DELETE FROM cola_evaluaciones WHERE client_uuid = ? AND usuario = ?', clientUuid, usuario);
}
