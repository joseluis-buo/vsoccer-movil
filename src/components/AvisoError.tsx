import { StyleSheet, Text, View } from 'react-native';

import { Colores } from '@/constants/colores';

type Props = {
  titulo?: string;
  /** El texto que mandó el servidor en "detail", tal cual. */
  mensaje: string;
};

export function AvisoError({ titulo, mensaje }: Props) {
  return (
    <View style={estilos.caja} accessibilityRole="alert">
      {titulo ? <Text style={estilos.titulo}>{titulo}</Text> : null}
      <Text style={estilos.mensaje}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    backgroundColor: Colores.fondoError,
    borderLeftWidth: 4,
    borderLeftColor: Colores.error,
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  titulo: { fontSize: 16, fontWeight: '700', color: Colores.error },
  mensaje: { fontSize: 15, color: Colores.texto, lineHeight: 21 },
});
