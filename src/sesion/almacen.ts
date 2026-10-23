import * as SecureStore from 'expo-secure-store';

import type { Modo } from './modos';

// Todo lo de la sesión vive en SecureStore (llavero del sistema), nunca en
// AsyncStorage: así lo pide la regla 5 de CLAUDE.md.
const LLAVE_ACCESS = 'vs.access';
const LLAVE_REFRESH = 'vs.refresh';
const LLAVE_PERFIL = 'vs.perfil';

export type Perfil = {
  nombre: string;
  rol: string;
  roles: string[];
  modo: Modo;
};

export async function guardarTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(LLAVE_ACCESS, access);
  await SecureStore.setItemAsync(LLAVE_REFRESH, refresh);
}

export function leerAccess() {
  return SecureStore.getItemAsync(LLAVE_ACCESS);
}

export function leerRefresh() {
  return SecureStore.getItemAsync(LLAVE_REFRESH);
}

export async function guardarPerfil(perfil: Perfil) {
  await SecureStore.setItemAsync(LLAVE_PERFIL, JSON.stringify(perfil));
}

export async function leerPerfil(): Promise<Perfil | null> {
  const texto = await SecureStore.getItemAsync(LLAVE_PERFIL);
  return texto ? (JSON.parse(texto) as Perfil) : null;
}

export async function borrarSesion() {
  await SecureStore.deleteItemAsync(LLAVE_ACCESS);
  await SecureStore.deleteItemAsync(LLAVE_REFRESH);
  await SecureStore.deleteItemAsync(LLAVE_PERFIL);
}

/** true si el token JWT todavía no llega a su fecha de vencimiento (`exp`). */
export function tokenVigente(token: string) {
  try {
    // El JWT es encabezado.contenido.firma; el contenido es JSON en base64url.
    let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const contenido = JSON.parse(atob(base64)) as { exp: number };
    return contenido.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
