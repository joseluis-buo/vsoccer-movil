import { StyleSheet, Text, View } from 'react-native';

import type { Evaluacion } from '@/api/familia';
import { Colores } from '@/constants/colores';
import { formatearFecha } from '@/utils/fechas';

// Tarjeta de arriba en la ficha (10): las tres habilidades con barra, el
// promedio del servidor y la nota de quien la capturó.
export function UltimaEvaluacion({ evaluacion }: { evaluacion: Evaluacion }) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.tarjeta}>
        <View style={estilos.fila}>
          <Text style={estilos.titulo}>Última evaluación</Text>
          <Text style={estilos.fecha}>{formatearFecha(evaluacion.fecha)}</Text>
        </View>

        <Habilidad nombre="Pase" valor={evaluacion.pase} />
        <Habilidad nombre="Recepción" valor={evaluacion.recepcion} />
        <Habilidad nombre="Tiro" valor={evaluacion.tiro} />

        <View style={[estilos.fila, estilos.lineaPromedio]}>
          <Text style={estilos.promedioEtiqueta}>Promedio</Text>
          <Text style={estilos.promedioValor}>{evaluacion.promedio.toFixed(1)}</Text>
        </View>
      </View>

      {evaluacion.observaciones ? (
        <View style={estilos.tarjeta}>
          <Text style={estilos.observaciones}>
            <Text style={estilos.autor}>{evaluacion.capturada_por ?? 'Entrenador'}: </Text>
            {evaluacion.observaciones}
          </Text>
        </View>
      ) : (
        <Text style={estilos.capturo}>Capturó: {evaluacion.capturada_por ?? 'Entrenador'} · sin observaciones</Text>
      )}
    </View>
  );
}

/** Calificación de 1 a 10: la barra se llena en proporción. */
function Habilidad({ nombre, valor }: { nombre: string; valor: number }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.habilidad}>{nombre}</Text>
      <View style={estilos.barra}>
        <View style={[estilos.relleno, { width: `${valor * 10}%` }]} />
      </View>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 12 },
  tarjeta: { backgroundColor: Colores.blanco, borderRadius: 18, padding: 18, gap: 14 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titulo: { flex: 1, fontSize: 18, fontWeight: '800', color: Colores.texto },
  fecha: { fontSize: 15, color: Colores.textoSuave },
  habilidad: { width: 96, fontSize: 17, fontWeight: '700', color: Colores.texto },
  barra: { flex: 1, height: 12, borderRadius: 6, backgroundColor: Colores.borde, overflow: 'hidden' },
  relleno: { height: '100%', backgroundColor: Colores.mentaOscuro },
  valor: { width: 28, textAlign: 'right', fontSize: 18, fontWeight: '800', color: Colores.texto },
  lineaPromedio: { borderTopWidth: 1, borderTopColor: Colores.borde, paddingTop: 14 },
  promedioEtiqueta: { flex: 1, fontSize: 18, fontWeight: '800', color: Colores.texto },
  promedioValor: { fontSize: 38, fontWeight: '900', color: Colores.texto },
  observaciones: { fontSize: 16, lineHeight: 23, color: Colores.texto },
  autor: { fontWeight: '800' },
  capturo: { fontSize: 15, color: Colores.textoSuave, paddingHorizontal: 4 },
});
