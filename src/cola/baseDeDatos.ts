import * as SQLite from 'expo-sqlite';

// La base local del teléfono. Tiene dos tablas:
//   cola_evaluaciones — capturas que todavía no llegan al servidor (cola.ts)
//   copia_api         — la última lista de grupos y alumnos que mandó la API,
//                       para poder abrirlas sin señal (copiaLocal.ts)
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

  CREATE TABLE IF NOT EXISTS copia_api (
    usuario  TEXT NOT NULL,
    clave    TEXT NOT NULL,
    datos    TEXT NOT NULL,
    guardada TEXT NOT NULL,
    PRIMARY KEY (usuario, clave)
  );
`;

// La base se abre una sola vez y todos comparten la misma conexión.
let conexion: Promise<SQLite.SQLiteDatabase> | null = null;

export function baseDeDatos() {
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
