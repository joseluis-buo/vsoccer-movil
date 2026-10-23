import { useSesion } from '@/sesion/SesionContext';

import { Boton } from './Boton';

// Al borrar la sesión, la navegación regresa sola al login.
export function BotonCerrarSesion() {
  const { cerrarSesion } = useSesion();
  return <Boton titulo="Cerrar sesión" variante="contorno" onPress={cerrarSesion} />;
}
