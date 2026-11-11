import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colores } from '@/constants/colores';

// "‹ Mis hijos" del prototipo, con área de toque amplia para la cancha.
export function BotonRegresar({ texto }: { texto: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Regresar a ${texto}`}
      // Si se llegó directo (sin pantalla anterior), index decide a dónde ir.
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      hitSlop={12}
      style={estilos.boton}>
      <Text style={estilos.texto}>‹ {texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
  texto: { fontSize: 18, fontWeight: '700', color: Colores.morado },
});
