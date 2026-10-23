import Constants from 'expo-constants';

import { borrarSesion, guardarTokens, leerAccess, leerRefresh } from '@/sesion/almacen';

// Único punto por donde pasan todas las peticiones a la API.
// La URL base sale de app.config.ts (variable API_URL), nunca del código.
const URL_BASE: string | undefined = Constants.expoConfig?.extra?.apiUrl;

// Si el servidor no contesta en este tiempo, se da por perdida la conexión.
const ESPERA_MAXIMA_MS = 15000;

/** Error que vino de la API. `status` 0 significa que ni siquiera hubo respuesta. */
export class ErrorApi extends Error {
  constructor(
    public status: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

type Opciones = {
  metodo?: 'GET' | 'POST' | 'PATCH';
  cuerpo?: unknown;
  // Login, activación y refresh no llevan token ni deben disparar la renovación.
  publica?: boolean;
};

// La sesión (SesionContext) se registra aquí para enterarse cuando hay que
// volver al login. Así el cliente no depende de React.
let alCaducarSesion = () => {};

export function alTerminarSesion(funcion: () => void) {
  alCaducarSesion = funcion;
}

export async function peticion<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  let respuesta = await enviar(ruta, opciones);

  // Renovación invisible: ante un 401 se renueva el access y se reintenta
  // la petición original una sola vez.
  if (respuesta.status === 401 && !opciones.publica) {
    const resultado = await renovarTokens();
    if (resultado === 'sin-conexion') {
      throw new ErrorApi(0, 'Se perdió la conexión con el servidor. Intenta de nuevo.');
    }
    if (resultado === 'renovado') {
      respuesta = await enviar(ruta, opciones);
    }
    // Si el refresh fue rechazado, o el reintento vuelve a dar 401, la sesión
    // ya no sirve: se borran los tokens y la navegación regresa al login.
    if (resultado === 'rechazado' || respuesta.status === 401) {
      await borrarSesion();
      alCaducarSesion();
    }
  }

  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, await leerDetalle(respuesta));
  }
  if (respuesta.status === 204) {
    return undefined as T;
  }
  return (await respuesta.json()) as T;
}

async function enviar(ruta: string, { metodo = 'GET', cuerpo, publica }: Opciones) {
  if (!URL_BASE) {
    throw new ErrorApi(0, 'La app no sabe a qué servidor conectarse: falta API_URL en .env.local.');
  }
  const url = URL_BASE.replace(/\/?$/, '/') + ruta;

  const encabezados: Record<string, string> = { Accept: 'application/json' };
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json';
  if (!publica) {
    const access = await leerAccess();
    if (access) encabezados.Authorization = `Bearer ${access}`;
  }

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), ESPERA_MAXIMA_MS);
  try {
    return await fetch(url, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: control.signal,
    });
  } catch {
    // En desarrollo se muestra la URL: casi siempre el problema es la IP.
    const donde = __DEV__ ? ` (${url})` : '';
    throw new ErrorApi(0, `No se pudo conectar con el servidor${donde}. Revisa tu conexión.`);
  } finally {
    clearTimeout(temporizador);
  }
}

/** La API siempre responde los errores como {"detail": "..."}; ese texto es el que se muestra. */
async function leerDetalle(respuesta: Response) {
  try {
    const datos = await respuesta.json();
    if (typeof datos?.detail === 'string') return datos.detail;
  } catch {
    // La respuesta no era JSON (p. ej. una página de error de Django).
  }
  return `El servidor respondió ${respuesta.status} sin más detalle.`;
}

type Renovacion = 'renovado' | 'rechazado' | 'sin-conexion';

// Si varias peticiones reciben 401 al mismo tiempo, todas esperan la misma
// renovación. Con rotación de refresh, un segundo intento con el refresh
// viejo sería rechazado y cerraría la sesión sin motivo.
let renovacionEnCurso: Promise<Renovacion> | null = null;

function renovarTokens() {
  renovacionEnCurso ??= intentarRenovar().finally(() => {
    renovacionEnCurso = null;
  });
  return renovacionEnCurso;
}

async function intentarRenovar(): Promise<Renovacion> {
  const refresh = await leerRefresh();
  if (!refresh) return 'rechazado';
  try {
    const respuesta = await enviar('token/refresh/', {
      metodo: 'POST',
      cuerpo: { refresh },
      publica: true,
    });
    if (!respuesta.ok) return 'rechazado';
    const datos = (await respuesta.json()) as { access: string; refresh?: string };
    await guardarTokens(datos.access, datos.refresh ?? refresh);
    return 'renovado';
  } catch {
    // Sin señal no se cierra la sesión: el entrenador debe poder seguir
    // capturando y la renovación se intentará en la siguiente petición.
    return 'sin-conexion';
  }
}
