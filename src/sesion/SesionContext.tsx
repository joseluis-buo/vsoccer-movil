import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { DatosDeSesion } from '@/api/autenticacion';
import { alTerminarSesion } from '@/api/cliente';
import { olvidarHistoriales } from '@/api/familia';
import { borrarCopias } from '@/cola/copiaLocal';

import {
  borrarSesion,
  guardarPerfil,
  guardarTokens,
  leerPerfil,
  leerRefresh,
  tokenVigente,
  usuarioDelToken,
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
    alTerminarSesion(() => {
      olvidarHistoriales();
      borrarCopias().catch(() => {});
      setPerfil(null);
    });
    restaurarSesion()
      .then(setPerfil)
      .finally(() => setCargando(false));
  }, []);

  async function entrar(datos: DatosDeSesion) {
    const modo = modoInicial(datos.rol, datos.roles);
    if (!modo) {
      throw new Error('Tu cuenta no tiene acceso a la app móvil. Usa el sistema web de la escuela.');
    }
    const usuario = usuarioDelToken(datos.access);
    if (!usuario) {
      throw new Error('El servidor respondió un token sin usuario. Intenta de nuevo.');
    }
    const nuevo: Perfil = { usuario, nombre: datos.nombre, rol: datos.rol, roles: datos.roles, modo };
    await guardarTokens(datos.access, datos.refresh);
    await guardarPerfil(nuevo);
    setPerfil(nuevo);
  }

  // Un entrenador que también es papá pasa al modo Familia (y de regreso) sin
  // volver a iniciar sesión. Lo usa BotonCambiarModo, en las pantallas de Perfil.
  async function cambiarModo(modo: Modo) {
    if (!perfil || !modosDisponibles(perfil.roles).includes(modo)) return;
    const nuevo = { ...perfil, modo };
    await guardarPerfil(nuevo);
    setPerfil(nuevo);
  }

  async function cerrarSesion() {
    olvidarHistoriales();
    // Las listas guardadas para trabajar sin señal se borran; la cola de
    // evaluaciones no. Si SQLite falla, la sesión se cierra de todos modos.
    await borrarCopias().catch(() => {});
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
    if (refresh && perfil && tokenVigente(refresh)) {
      // Las sesiones guardadas antes de que existiera la cola no traían el
      // usuario; se saca del refresh, que también lo lleva.
      const usuario = perfil.usuario ?? usuarioDelToken(refresh);
      if (usuario) return { ...perfil, usuario };
    }
  } catch {
    // Datos ilegibles: se tratan como si no hubiera sesión.
  }
  await borrarSesion().catch(() => {});
  return null;
}
