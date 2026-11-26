import { ErrorApi } from '@/api/cliente';
import { enviarEvaluacion, type EvaluacionGuardada, type NuevaEvaluacion } from '@/api/entrenador';

import { anotarIntento, leerCola, quitarDeCola } from './cola';

// Manda al servidor lo que está en la cola y decide qué pasa con cada fila.

export type ResultadoEnvio =
  /** El servidor la tiene (201 nueva o 200 si ya la tenía). Ya salió de la cola. */
  | { tipo: 'enviada'; guardada: EvaluacionGuardada }
  /** No llegó, pero puede llegar después: sigue pendiente. */
  | { tipo: 'pendiente'; sinSenal: boolean; motivo: string }
  /** El servidor dijo que no. Se queda como rechazada, ya no se reintenta. */
  | { tipo: 'rechazada'; motivo: string };

/**
 * Intenta mandar una evaluación de la cola y anota el resultado en SQLite.
 * Se copian los campos uno por uno para mandar solo lo que pide la API, no
 * las columnas propias de la cola (estado, intentos…).
 */
export async function enviarDeLaCola(usuario: string, fila: NuevaEvaluacion): Promise<ResultadoEnvio> {
  try {
    const guardada = await enviarEvaluacion({
      client_uuid: fila.client_uuid,
      alumno: fila.alumno,
      fecha: fila.fecha,
      pase: fila.pase,
      recepcion: fila.recepcion,
      tiro: fila.tiro,
      observaciones: fila.observaciones,
    });
    await quitarDeCola(usuario, fila.client_uuid);
    return { tipo: 'enviada', guardada };
  } catch (error) {
    const motivo = error instanceof Error ? error.message : 'Error inesperado.';
    if (esRechazoDefinitivo(error)) {
      await anotarIntento(fila.client_uuid, 'rechazada', motivo);
      return { tipo: 'rechazada', motivo };
    }
    await anotarIntento(fila.client_uuid, 'pendiente', motivo);
    const sinSenal = error instanceof ErrorApi && error.status === 0;
    return { tipo: 'pendiente', sinSenal, motivo };
  }
}

/**
 * ¿Reintentar daría el mismo "no"? Los 4xx dicen que el problema es la
 * evaluación misma: 409 (ya evaluado hoy), 400 (fecha de más de 7 días o
 * futura), 403 (grupo que ya no es suyo), 404 (alumno que ya no le toca).
 *
 * Se reintentan: sin señal (status 0), errores del servidor (5xx), 408, 429
 * (demasiadas peticiones) y 401 (sesión vencida: al volver a entrar se manda).
 */
function esRechazoDefinitivo(error: unknown) {
  if (!(error instanceof ErrorApi)) return false;
  const { status } = error;
  return status >= 400 && status < 500 && ![401, 408, 429].includes(status);
}

export type ResumenEnvio = { enviadas: number; rechazadas: number; sinEnviar: number; sinSenal: boolean };

// Si el Inicio y la pestaña Sincronizar piden enviar a la vez, comparten el
// mismo envío en lugar de mandar todo dos veces.
let envioEnCurso: Promise<ResumenEnvio> | null = null;

/** Manda, una por una, todas las pendientes del usuario. */
export function enviarPendientes(usuario: string) {
  envioEnCurso ??= enviarTodas(usuario).finally(() => {
    envioEnCurso = null;
  });
  return envioEnCurso;
}

/** "Se enviaron 3. 1 fue rechazada." para mostrar después del envío. */
export function textoDelResumen({ enviadas, rechazadas, sinEnviar, sinSenal }: ResumenEnvio) {
  const partes: string[] = [];
  if (enviadas > 0) partes.push(`Se ${enviadas === 1 ? 'envió 1' : `enviaron ${enviadas}`}.`);
  if (rechazadas > 0) partes.push(`${rechazadas} ${rechazadas === 1 ? 'fue rechazada' : 'fueron rechazadas'}.`);
  if (sinEnviar > 0) {
    const causa = sinSenal ? 'Sin conexión' : 'El servidor no respondió';
    partes.push(`${causa}: ${sinEnviar} ${sinEnviar === 1 ? 'sigue' : 'siguen'} en el teléfono.`);
  }
  return partes.length > 0 ? partes.join(' ') : 'No había nada que enviar.';
}

async function enviarTodas(usuario: string): Promise<ResumenEnvio> {
  const pendientes = (await leerCola(usuario)).filter((fila) => fila.estado === 'pendiente');
  const resumen: ResumenEnvio = { enviadas: 0, rechazadas: 0, sinEnviar: 0, sinSenal: false };

  for (const [i, fila] of pendientes.entries()) {
    const resultado = await enviarDeLaCola(usuario, fila);
    if (resultado.tipo === 'enviada') resumen.enviadas++;
    if (resultado.tipo === 'rechazada') resumen.rechazadas++;
    if (resultado.tipo === 'pendiente') {
      // Si una no pasó por falta de señal o porque el servidor está caído,
      // las demás tampoco van a pasar: no tiene caso esperar a cada una.
      resumen.sinEnviar = pendientes.length - i;
      resumen.sinSenal = resultado.sinSenal;
      break;
    }
  }
  return resumen;
}
