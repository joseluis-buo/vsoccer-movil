import { ErrorApi } from '@/api/cliente';

import { baseDeDatos } from './baseDeDatos';
import { enviarPendientes } from './envio';

// Copia local para abrir pantallas sin señal: los grupos del entrenador, los
// alumnos de cada grupo, la ficha (histórico) de cada alumno que ya abrió, y
// en modo Familia la lista de hijos. Cada vez que la API responde, se guarda
// la respuesta tal cual (JSON). Si después no hay red, se muestra esa copia
// avisando de cuándo es. No es otra fuente de verdad: en cuanto hay señal,
// manda otra vez el servidor.

export type ConCopia<T> = {
  datos: T;
  /** null = recién llegados del servidor · fecha ISO = copia guardada sin red */
  guardada: string | null;
};

/**
 * Pide los datos a la API y guarda la copia. Solo si falla por FALTA DE RED
 * (status 0) usa la copia. Un 403 o un 500 no: ahí el servidor sí contestó y
 * su respuesta es la que vale. Sin copia guardada, el error pasa igual.
 *
 * `clave` identifica la lista, p. ej. "mis-grupos", "alumnos?grupo=MINI-LUN_MIE",
 * "historial?alumno=12" o "mis-hijos".
 */
export async function conCopiaLocal<T>(usuario: string, clave: string, pedir: () => Promise<T>): Promise<ConCopia<T>> {
  try {
    const datos = await pedir();
    // Si SQLite falla, los datos del servidor igual sirven: no se interrumpe.
    await guardarCopia(usuario, clave, datos).catch(() => {});
    // El servidor contestó: buen momento para mandar lo que esté en la cola
    // (cubre el caso de "había red, pero el servidor estaba caído").
    enviarPendientes(usuario).catch(() => {});
    return { datos, guardada: null };
  } catch (error) {
    if (!(error instanceof ErrorApi && error.status === 0)) throw error;
    const copia = await leerCopia<T>(usuario, clave).catch(() => null);
    if (!copia) throw error;
    return copia;
  }
}

async function guardarCopia(usuario: string, clave: string, datos: unknown) {
  const db = await baseDeDatos();
  await db.runAsync(
    `INSERT INTO copia_api (usuario, clave, datos, guardada) VALUES (?, ?, ?, ?)
     ON CONFLICT(usuario, clave) DO UPDATE SET datos = excluded.datos, guardada = excluded.guardada`,
    usuario,
    clave,
    JSON.stringify(datos),
    new Date().toISOString(),
  );
}

async function leerCopia<T>(usuario: string, clave: string): Promise<ConCopia<T> | null> {
  const db = await baseDeDatos();
  const fila = await db.getFirstAsync<{ datos: string; guardada: string }>(
    'SELECT datos, guardada FROM copia_api WHERE usuario = ? AND clave = ?',
    usuario,
    clave,
  );
  return fila ? { datos: JSON.parse(fila.datos) as T, guardada: fila.guardada } : null;
}

/**
 * Al cerrar sesión se borran TODAS las copias (son nombres de menores).
 * No se pierde nada: para volver a entrar hace falta red, y con red las
 * listas se vuelven a bajar. La cola de evaluaciones NO se toca aquí.
 */
export async function borrarCopias() {
  const db = await baseDeDatos();
  await db.runAsync('DELETE FROM copia_api');
}
