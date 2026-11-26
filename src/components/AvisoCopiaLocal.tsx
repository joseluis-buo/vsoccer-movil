import { StyleSheet, Text, View } from 'react-native';

import { Colores } from '@/constants/colores';
import { formatearMomento } from '@/utils/fechas';

import { Boton } from './Boton';

type Props = {
  /** Fecha ISO en que se guardó la copia que se está mostrando. */
  guardada: string;
  /** Vuelve a pedir los datos al servidor. */
  onRecargar: () => void;
};

// Reemplaza a la tarjeta roja de "No se pudo cargar" cuando sí hay una copia
// en el teléfono: el entrenador puede seguir trabajando, pero sabe que la
// lista puede estar vieja y tiene cómo pedirla de nuevo.
export function AvisoCopiaLocal({ guardada, onRecargar }: Props) {
  return (
    <View style={estilos.caja} accessibilityRole="alert">
      <Text style={estilos.titulo}>Sin conexión · lista guardada</Text>
      <Text style={estilos.texto}>Estos datos se descargaron {formatearMomento(guardada)}.</Text>
      <Boton titulo="Intentar de nuevo" variante="contorno" onPress={onRecargar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    backgroundColor: Colores.blanco,
    borderLeftWidth: 5,
    borderLeftColor: Colores.morado,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  titulo: { fontSize: 16, fontWeight: '800', color: Colores.morado },
  texto: { fontSize: 15, color: Colores.texto, lineHeight: 21 },
});
