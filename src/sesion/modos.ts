// La app tiene dos modos y la API manda roles. Aquí se traduce uno a otro.
export type Modo = 'entrenador' | 'familia';

const MODO_DE_CADA_ROL: Record<string, Modo | undefined> = {
  administrador: 'entrenador',
  entrenador: 'entrenador',
  tutor: 'familia',
  // secretaria no tiene modo en la app móvil: trabaja en la web.
};

/** Los modos a los que puede entrar alguien con estos roles, sin repetir. */
export function modosDisponibles(roles: string[]): Modo[] {
  const modos: Modo[] = [];
  for (const rol of roles) {
    const modo = MODO_DE_CADA_ROL[rol];
    if (modo && !modos.includes(modo)) modos.push(modo);
  }
  return modos;
}

/** El modo con el que se entra: el del rol principal o, si no tiene, el primero posible. */
export function modoInicial(rol: string, roles: string[]): Modo | null {
  return MODO_DE_CADA_ROL[rol] ?? modosDisponibles(roles)[0] ?? null;
}
