import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colores } from '@/constants/colores';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'morado' | 'menta' | 'contorno';
  cargando?: boolean;
  deshabilitado?: boolean;
};

// Botón grande (56 px de alto) para usarse en la cancha sin precisión del dedo.
export function Boton({ titulo, onPress, variante = 'morado', cargando, deshabilitado }: Props) {
  const colorTexto = variante === 'menta' ? Colores.moradoOscuro : variante === 'contorno' ? Colores.morado : Colores.blanco;
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactivo}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        estilos[variante],
        inactivo && estilos.inactivo,
        pressed && estilos.presionado,
      ]}>
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <Text style={[estilos.texto, { color: colorTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  morado: { backgroundColor: Colores.morado },
  menta: { backgroundColor: Colores.menta },
  contorno: { borderWidth: 2, borderColor: Colores.morado, backgroundColor: Colores.blanco },
  inactivo: { opacity: 0.5 },
  presionado: { opacity: 0.8 },
  texto: { fontSize: 18, fontWeight: '700' },
});
