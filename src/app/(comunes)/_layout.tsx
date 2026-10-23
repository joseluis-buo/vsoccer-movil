import { Stack } from 'expo-router';

import { Colores } from '@/constants/colores';

export default function LayoutComunes() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colores.fondo } }} />;
}
