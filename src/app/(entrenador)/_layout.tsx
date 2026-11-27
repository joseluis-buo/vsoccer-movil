import { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEnvioAutomatico } from '@/cola/useEnvioAutomatico';
import { altoDeLaBarra, IconoPestana } from '@/components/IconoPestana';
import { Colores } from '@/constants/colores';

// Modo Entrenador: acento morado.
export default function LayoutEntrenador() {
  // Mientras el entrenador esté en su modo, la cola se envía sola al
  // recuperar la señal.
  useEnvioAutomatico();

  const abajo = useSafeAreaInsets().bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colores.morado,
        tabBarInactiveTintColor: Colores.textoSuave,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarStyle: { ...altoDeLaBarra(abajo), backgroundColor: Colores.blanco },
      }}>
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => <IconoPestana forma="cuadro" color={color} activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="grupos"
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color, focused }) => <IconoPestana forma="cuadro" color={color} activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="sincronizar"
        options={{
          title: 'Sincronizar',
          tabBarIcon: ({ color, focused }) => <IconoPestana forma="circulo" color={color} activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => <IconoPestana forma="circulo" color={color} activo={focused} />,
        }}
      />
    </Tabs>
  );
}
