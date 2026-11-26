import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Modo } from './modos';

// En el teléfono todo lo de la sesión vive en SecureStore (llavero del
// sistema), nunca en AsyncStorage: así lo pide la regla 5 de CLAUDE.md.
//
// SecureStore no existe en el navegador. La versión web es SOLO PARA
// DESARROLLO (armar pantallas rápido), así que ahí se usa localStorage y el
// token queda menos protegido: cualquier script de la página puede leerlo.
// No quitar este caso ni usar localStorage fuera de la web.
const guardado =
  Platform.OS === 'web'
    ? {
        setItemAsync: async (llave: string, valor: string) => localStorage.setItem(llave, valor),
        getItemAsync: async (llave: string) => localStorage.getItem(llave),
        deleteItemAsync: async (llave: string) => localStorage.removeItem(llave),
      }
    : SecureStore;

const LLAVE_ACCESS = 'vs.access';
const LLAVE_REFRESH = 'vs.refresh';
const LLAVE_PERFIL = 'vs.perfil';

export type Perfil = {
  /** id del usuario en el servidor; separa la cola de captura de cada entrenador. */
  usuario: string;
  nombre: string;
  rol: string;
  roles: string[];
  modo: Modo;
};

export async function guardarTokens(access: string, refresh: string) {
  await guardado.setItemAsync(LLAVE_ACCESS, access);
  await guardado.setItemAsync(LLAVE_REFRESH, refresh);
}

export function leerAccess() {
  return guardado.getItemAsync(LLAVE_ACCESS);
}

export function leerRefresh() {
  return guardado.getItemAsync(LLAVE_REFRESH);
}

export async function guardarPerfil(perfil: Perfil) {
  await guardado.setItemAsync(LLAVE_PERFIL, JSON.stringify(perfil));
}

export async function leerPerfil(): Promise<Perfil | null> {
  const texto = await guardado.getItemAsync(LLAVE_PERFIL);
  return texto ? (JSON.parse(texto) as Perfil) : null;
}

export async function borrarSesion() {
  await guardado.deleteItemAsync(LLAVE_ACCESS);
  await guardado.deleteItemAsync(LLAVE_REFRESH);
  await guardado.deleteItemAsync(LLAVE_PERFIL);
}

/** true si el token JWT todavía no llega a su fecha de vencimiento (`exp`). */
export function tokenVigente(token: string) {
  const contenido = leerContenidoJwt(token);
  return typeof contenido?.exp === 'number' && contenido.exp * 1000 > Date.now();
}

/**
 * El id del usuario que viene dentro del token (`user_id`, lo pone
 * simplejwt). El login no lo manda aparte. Según la versión de simplejwt
 * llega como número o como texto; se guarda siempre como texto.
 */
export function usuarioDelToken(token: string): string | null {
  const id = leerContenidoJwt(token)?.user_id;
  return id === undefined || id === null ? null : String(id);
}

// El JWT es encabezado.contenido.firma; el contenido es JSON en base64url.
// Solo se lee: la firma la revisa el servidor, no la app.
function leerContenidoJwt(token: string): { exp?: number; user_id?: string | number } | null {
  try {
    let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}
