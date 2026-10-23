import { Tabs } from 'expo-router/js-tabs';

import { IconoPestana } from '@/components/IconoPestana';
import { Colores } from '@/constants/colores';

// Modo Familia: acento menta. El texto activo va en oscuro porque menta sobre
// blanco casi no se lee con sol; el ícono sí va en menta, como en el prototipo.
export default function LayoutFamilia() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colores.texto,
        tabBarInactiveTintColor: Colores.textoSuave,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarStyle: { backgroundColor: Colores.blanco, borderTopColor: Colores.menta, borderTopWidth: 2 },
      }}>
      <Tabs.Screen
        name="hijos"
        options={{
          title: 'Hijos',
          tabBarIcon: ({ focused }) => <IconoPestana forma="cuadro" color={Colores.menta} activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="progreso"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ focused }) => <IconoPestana forma="cuadro" color={Colores.menta} activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="avisos"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ focused }) => <IconoPestana forma="circulo" color={Colores.menta} activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <IconoPestana forma="circulo" color={Colores.menta} activo={focused} />,
        }}
      />
    </Tabs>
  );
}
