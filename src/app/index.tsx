import { Redirect } from 'expo-router';

import { useSesion } from '@/sesion/SesionContext';

// Punto de entrada: manda a cada quien a su zona según la sesión.
export default function Inicio() {
  const { perfil } = useSesion();

  if (!perfil) return <Redirect href="/login" />;
  if (perfil.modo === 'entrenador') return <Redirect href="/inicio" />;
  return <Redirect href="/hijos" />;
}
