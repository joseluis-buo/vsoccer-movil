import { BotonCerrarSesion } from '@/components/BotonCerrarSesion';
import { PantallaVacia } from '@/components/PantallaVacia';

export default function PantallaPerfil() {
  return (
    <PantallaVacia numero="13" titulo="Perfil">
      <BotonCerrarSesion />
    </PantallaVacia>
  );
}
