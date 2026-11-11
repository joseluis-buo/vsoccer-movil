import { StyleSheet, Text, View } from 'react-native';

import type { Evaluacion } from '@/api/familia';
import { Colores } from '@/constants/colores';
import { formatearFecha } from '@/utils/fechas';

// Un renglón del histórico en la ficha (10).
export function FilaHistorial({ evaluacion }: { evaluacion: Evaluacion }) {
  return (
    <View style={estilos.fila}>
      <View style={estilos.izquierda}>
        <Text style={estilos.fecha}>{formatearFecha(evaluacion.fecha)}</Text>
        <Text style={estilos.detalle}>
          Pase {evaluacion.pase} · Recepción {evaluacion.recepcion} · Tiro {evaluacion.tiro}
        </Text>
        {evaluacion.capturada_por ? <Text style={estilos.autor}>{evaluacion.capturada_por}</Text> : null}
      </View>
      <Text style={estilos.promedio}>{evaluacion.promedio.toFixed(1)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.blanco,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  izquierda: { flex: 1, gap: 3 },
  fecha: { fontSize: 17, fontWeight: '800', color: Colores.texto },
  detalle: { fontSize: 15, color: Colores.texto },
  autor: { fontSize: 14, color: Colores.textoSuave },
  promedio: { fontSize: 26, fontWeight: '900', color: Colores.morado },
});
