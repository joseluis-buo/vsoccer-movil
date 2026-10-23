import { Tabs } from 'expo-router/js-tabs';

import { IconoPestana } from '@/components/IconoPestana';
import { Colores } from '@/constants/colores';

// Modo Entrenador: acento morado.
export default function LayoutEntrenador() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colores.morado,
        tabBarInactiveTintColor: Colores.textoSuave,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarStyle: { backgroundColor: Colores.blanco },
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
