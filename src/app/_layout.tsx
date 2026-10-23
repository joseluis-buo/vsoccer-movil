import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colores } from '@/constants/colores';
import { SesionProvider, useSesion } from '@/sesion/SesionContext';

// El splash (01) se queda visible hasta saber si hay sesión guardada.
SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  return (
    <SesionProvider>
      <StatusBar style="dark" />
      <Navegacion />
    </SesionProvider>
  );
}

// Tres zonas: comunes (sin sesión), entrenador y familia. Cada Stack.Protected
// solo deja entrar si su condición se cumple; cuando la sesión cambia (entrar,
// cerrar sesión, cambiar de modo) expo-router saca al usuario de la zona que
// ya no le toca y lo manda a index, que decide a dónde ir.
function Navegacion() {
  const { cargando, perfil } = useSesion();

  useEffect(() => {
    if (!cargando) SplashScreen.hideAsync();
  }, [cargando]);

  if (cargando) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colores.fondo } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!perfil}>
        <Stack.Screen name="(comunes)" />
      </Stack.Protected>
      <Stack.Protected guard={perfil?.modo === 'entrenador'}>
        <Stack.Screen name="(entrenador)" />
      </Stack.Protected>
      <Stack.Protected guard={perfil?.modo === 'familia'}>
        <Stack.Screen name="(familia)" />
      </Stack.Protected>
    </Stack>
  );
}
