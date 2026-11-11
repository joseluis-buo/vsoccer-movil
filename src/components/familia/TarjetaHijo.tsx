import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Hijo } from '@/api/familia';
import { Colores } from '@/constants/colores';

type Props = { hijo: Hijo; onPress: () => void };

export function TarjetaHijo({ hijo, onPress }: Props) {
  const ultima = hijo.ultima_evaluacion;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ficha de ${hijo.nombre}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.tarjeta, !hijo.activo && estilos.deBaja, pressed && estilos.presionada]}>
      <View style={estilos.datos}>
        <Text style={estilos.nombre}>{hijo.nombre}</Text>
        <Text style={estilos.grupo}>{hijo.categoria_nombre}</Text>
        <Text style={estilos.grupo}>{hijo.horario_nombre}</Text>
        {!hijo.activo ? <Text style={estilos.etiquetaBaja}>DADO DE BAJA</Text> : null}
      </View>

      <View style={estilos.promedio}>
        <Text style={estilos.promedioEtiqueta}>Promedio</Text>
        {ultima ? (
          // El promedio que se muestra es el que calculó el servidor.
          <Text style={estilos.promedioValor}>{ultima.promedio.toFixed(1)}</Text>
        ) : (
          <Text style={estilos.sinEvaluar}>Sin evaluar</Text>
        )}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.blanco,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: Colores.borde,
  },
  deBaja: { backgroundColor: '#ECE8F3', borderStyle: 'dashed' },
  presionada: { opacity: 0.8 },
  datos: { flex: 1, gap: 2 },
  nombre: { fontSize: 20, fontWeight: '800', color: Colores.texto },
  grupo: { fontSize: 15, color: Colores.textoSuave },
  etiquetaBaja: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colores.error,
    color: Colores.blanco,
    fontSize: 12,
    fontWeight: '800',
  },
  promedio: { alignItems: 'flex-end' },
  promedioEtiqueta: { fontSize: 13, fontWeight: '600', color: Colores.textoSuave },
  promedioValor: { fontSize: 34, fontWeight: '900', color: Colores.texto },
  sinEvaluar: { fontSize: 15, fontWeight: '700', color: Colores.textoSuave, marginTop: 4 },
});
