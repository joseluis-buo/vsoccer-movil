import { StyleSheet, Text, View } from 'react-native';

import type { Evaluacion } from '@/api/familia';
import { Colores } from '@/constants/colores';
import { formatearFecha } from '@/utils/fechas';

// Tabla "Últimas evaluaciones" de la ficha del entrenador (08): una fila por
// evaluación, la más nueva arriba. El promedio es el que calculó el servidor.
export function TablaHistorial({ evaluaciones }: { evaluaciones: Evaluacion[] }) {
  return (
    <View style={estilos.tabla}>
      <View style={[estilos.fila, estilos.encabezado]}>
        <Text style={[estilos.fecha, estilos.titulo]}>Fecha</Text>
        <Text style={[estilos.celda, estilos.titulo]}>Pase</Text>
        <Text style={[estilos.celda, estilos.titulo]}>Rec.</Text>
        <Text style={[estilos.celda, estilos.titulo]}>Tiro</Text>
        <Text style={[estilos.promedio, estilos.titulo]}>Prom.</Text>
      </View>
      {evaluaciones.map((ev) => (
        <View key={ev.id} style={estilos.fila}>
          <Text style={estilos.fecha}>{formatearFecha(ev.fecha)}</Text>
          <Text style={estilos.celda}>{ev.pase}</Text>
          <Text style={estilos.celda}>{ev.recepcion}</Text>
          <Text style={estilos.celda}>{ev.tiro}</Text>
          <Text style={estilos.promedio}>{ev.promedio.toFixed(1)}</Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  tabla: { backgroundColor: Colores.blanco, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: Colores.borde,
  },
  encabezado: { borderTopWidth: 0, minHeight: 40 },
  titulo: { fontSize: 13, fontWeight: '700', color: Colores.textoSuave },
  fecha: { flex: 1, fontSize: 16, fontWeight: '700', color: Colores.texto },
  celda: { width: 44, textAlign: 'center', fontSize: 17, color: Colores.texto },
  promedio: { width: 56, textAlign: 'right', fontSize: 18, fontWeight: '900', color: Colores.morado },
});
