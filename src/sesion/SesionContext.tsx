import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { DatosDeSesion } from '@/api/autenticacion';
import { alTerminarSesion } from '@/api/cliente';

import {
  borrarSesion,
  guardarPerfil,
  guardarTokens,
  leerPerfil,
  leerRefresh,
  tokenVigente,
  type Perfil,
} from './almacen';
import { modoInicial, modosDisponibles, type Modo } from './modos';

type ValorSesion = {
  /** true mientras se lee la sesión guardada al abrir la app (se ve el splash). */
  cargando: boolean;
  /** null si no hay sesión: la navegación muestra el login. */
  perfil: Perfil | null;
  /** Modos a los que puede entrar; si son dos, se puede ofrecer el cambio. */
  modos: Modo[];
  entrar: (datos: DatosDeSesion) => Promise<void>;
  cambiarModo: (modo: Modo) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const Contexto = createContext<ValorSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    // Si el cliente de la API no logra renovar el token, regresa al login.
    alTerminarSesion(() => setPerfil(null));
    restaurarSesion()
      .then(setPerfil)
      .finally(() => setCargando(false));
  }, []);

  async function entrar(datos: DatosDeSesion) {
    const modo = modoInicial(datos.rol, datos.roles);
    if (!modo) {
      throw new Error('Tu cuenta no tiene acceso a la app móvil. Usa el sistema web de la escuela.');
    }
    const nuevo: Perfil = { nombre: datos.nombre, rol: datos.rol, roles: datos.roles, modo };
    await guardarTokens(datos.access, datos.refresh);
    await guardarPerfil(nuevo);
    setPerfil(nuevo);
  }

  // Lista para cuando exista la pantalla: un entrenador que también es papá
  // puede pasar al modo Familia sin volver a iniciar sesión.
  async function cambiarModo(modo: Modo) {
    if (!perfil || !modosDisponibles(perfil.roles).includes(modo)) return;
    const nuevo = { ...perfil, modo };
    await guardarPerfil(nuevo);
    setPerfil(nuevo);
  }

  async function cerrarSesion() {
    await borrarSesion();
    setPerfil(null);
  }

  const modos = perfil ? modosDisponibles(perfil.roles) : [];

  return (
    <Contexto.Provider value={{ cargando, perfil, modos, entrar, cambiarModo, cerrarSesion }}>
      {children}
    </Contexto.Provider>
  );
}

export function useSesion() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return valor;
}

/**
 * Al abrir la app: si hay un refresh que no ha vencido, se entra directo.
 * No se consulta al servidor a propósito, para que el entrenador pueda abrir
 * la app sin señal. Si el servidor ya no acepta el token, la primera petición
 * fallará la renovación y el cliente mandará al login.
 */
async function restaurarSesion(): Promise<Perfil | null> {
  try {
    const refresh = await leerRefresh();
    const perfil = await leerPerfil();
    if (refresh && perfil && tokenVigente(refresh)) return perfil;
  } catch {
    // Datos ilegibles: se tratan como si no hubiera sesión.
  }
  await borrarSesion().catch(() => {});
  return null;
}
