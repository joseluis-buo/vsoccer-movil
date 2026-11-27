import { useSesion } from '@/sesion/SesionContext';

import { Boton } from './Boton';

// Un entrenador que también es papá de un alumno tiene los dos modos. Desde
// su Perfil pasa al otro sin volver a iniciar sesión. Con un solo modo, el
// botón no aparece. (Qué datos ve en cada modo lo decide la API, no la app.)
export function BotonCambiarModo() {
  const { perfil, modos, cambiarModo } = useSesion();
  const otro = modos.find((modo) => modo !== perfil?.modo);
  if (!otro) return null;

  return (
    <Boton
      titulo={otro === 'familia' ? 'Cambiar a modo Familia' : 'Cambiar a modo Entrenador'}
      variante={otro === 'familia' ? 'menta' : 'morado'}
      onPress={() => cambiarModo(otro)}
    />
  );
}
