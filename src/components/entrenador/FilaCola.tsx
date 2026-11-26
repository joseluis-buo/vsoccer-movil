import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { EvaluacionEnCola } from '@/cola/cola';
import { Boton } from '@/components/Boton';
import { Colores } from '@/constants/colores';
import { formatearFecha } from '@/utils/fechas';

type Props = {
  evaluacion: EvaluacionEnCola;
  /** Solo las rechazadas se pueden descartar. */
  onDescartar?: () => void;
};

// Una evaluación guardada en el teléfono, en la pestaña Sincronizar.
export function FilaCola({ evaluacion, onDescartar }: Props) {
  // Descartar borra la evaluación para siempre: se pide un segundo toque.
  // (Alert.alert no funciona en la versión web, por eso se hace así.)
  const [confirmando, setConfirmando] = useState(false);
  const rechazada = evaluacion.estado === 'rechazada';

  return (
    <View style={[estilos.tarjeta, rechazada && estilos.tarjetaRechazada]}>
      <View style={estilos.filaArriba}>
        <Text style={estilos.nombre}>{evaluacion.alumno_nombre}</Text>
        <Text style={estilos.fecha}>{formatearFecha(evaluacion.fecha, false)}</Text>
      </View>
      <Text style={estilos.calificaciones}>
        Pase {evaluacion.pase} · Recep. {evaluacion.recepcion} · Tiro {evaluacion.tiro}
      </Text>

      {evaluacion.ultimo_error ? (
        <Text style={rechazada ? estilos.motivo : estilos.detalle}>
          {rechazada ? 'Motivo: ' : `Intentos: ${evaluacion.intentos} · `}
          {evaluacion.ultimo_error}
        </Text>
      ) : null}

      {onDescartar &&
        (confirmando ? (
          <View style={estilos.botones}>
            <Text style={estilos.pregunta}>¿Descartarla? Se borra del teléfono y no se podrá recuperar.</Text>
            <Boton titulo="Sí, descartar" onPress={onDescartar} />
            <Boton titulo="Cancelar" variante="contorno" onPress={() => setConfirmando(false)} />
          </View>
        ) : (
          <Boton titulo="Descartar" variante="contorno" onPress={() => setConfirmando(true)} />
        ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { backgroundColor: Colores.blanco, borderRadius: 16, padding: 16, gap: 6 },
  tarjetaRechazada: { borderLeftWidth: 5, borderLeftColor: Colores.error },
  filaArriba: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  nombre: { flex: 1, fontSize: 18, fontWeight: '800', color: Colores.texto },
  fecha: { fontSize: 15, fontWeight: '700', color: Colores.textoSuave },
  calificaciones: { fontSize: 16, color: Colores.texto },
  detalle: { fontSize: 14, color: Colores.textoSuave, lineHeight: 20 },
  motivo: { fontSize: 15, color: Colores.error, fontWeight: '600', lineHeight: 21 },
  botones: { gap: 8, marginTop: 4 },
  pregunta: { fontSize: 15, fontWeight: '700', color: Colores.texto },
});
