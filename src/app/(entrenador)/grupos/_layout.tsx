import { Stack } from 'expo-router';

import { Colores } from '@/constants/colores';

export default function LayoutGrupos() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colores.fondo } }} />;
}
