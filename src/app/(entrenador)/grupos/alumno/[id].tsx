import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pedirHistorialDelAlumno } from '@/api/entrenador';
import type { Evaluacion } from '@/api/familia';
import { useDatos } from '@/api/useDatos';
import { conCopiaLocal } from '@/cola/copiaLocal';
import { useCola } from '@/cola/useCola';
import { AvisoCopiaLocal } from '@/components/AvisoCopiaLocal';
import { BotonRegresar } from '@/components/BotonRegresar';
import { TablaHistorial } from '@/components/entrenador/TablaHistorial';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { GraficaLineas, SERIES } from '@/components/familia/GraficaLineas';
import { Colores } from '@/constants/colores';
import { formatearFecha } from '@/utils/fechas';

// 08 · Ficha del alumno (modo Entrenador). Se abre desde la captura con
// "Ver historial". Sin señal se muestra la última copia guardada de esta ficha.
export default function PantallaFichaEntrenador() {
  const { id, nombre, grupoNombre } = useLocalSearchParams<{ id: string; nombre?: string; grupoNombre?: string }>();
  const alumnoId = Number(id);
  const { usuario, pendientes, rechazadas } = useCola();
  const { estado, reintentar } = useDatos(
    () => conCopiaLocal(usuario, `historial?alumno=${alumnoId}`, () => pedirHistorialDelAlumno(alumnoId)),
    alumnoId,
  );

  // Las de este alumno que siguen en el teléfono: todavía no tienen promedio
  // porque ese lo calcula el servidor al recibirlas.
  const enTelefono = [...pendientes, ...rechazadas].filter((e) => e.alumno === alumnoId);

  // Si la cola se envió sola mientras se ve la ficha, se vuelve a pedir el
  // histórico para que la evaluación aparezca ya con su promedio oficial.
  const cuantasEnTelefono = enTelefono.length;
  const antes = useRef(cuantasEnTelefono);
  useEffect(() => {
    if (cuantasEnTelefono < antes.current) reintentar();
    antes.current = cuantasEnTelefono;
  }, [cuantasEnTelefono, reintentar]);

  const copia = estado.tipo === 'listo' ? estado.datos : null;
  // La API las manda de la más vieja a la más nueva.
  const evaluaciones = copia?.datos.evaluaciones ?? [];
  const recientesPrimero = [...evaluaciones].reverse();

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <BotonRegresar texto="Captura" />
        <View>
          <Text style={estilos.nombre}>{copia?.datos.alumno.nombre ?? nombre ?? 'Ficha del alumno'}</Text>
          {grupoNombre ? <Text style={estilos.grupo}>{grupoNombre}</Text> : null}
        </View>

        {copia?.guardada && <AvisoCopiaLocal guardada={copia.guardada} onRecargar={reintentar} />}

        {enTelefono.map((e) => (
          <View key={e.client_uuid} style={estilos.enTelefono}>
            <Text style={estilos.enTelefonoTitulo}>
              {e.estado === 'pendiente' ? '◐ En teléfono · sin enviar' : '✕ Rechazada por el servidor'}
            </Text>
            <Text style={estilos.enTelefonoTexto}>
              {formatearFecha(e.fecha)} · Pase {e.pase} · Rec. {e.recepcion} · Tiro {e.tiro}
            </Text>
          </View>
        ))}

        {estado.tipo === 'cargando' && <Cargando texto="Cargando historial…" />}
        {estado.tipo === 'error' && <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && evaluaciones.length === 0 && (
          <Vacio titulo="Sin evaluaciones" explicacion="Cuando el servidor reciba su primera evaluación, aparecerá aquí." />
        )}

        {evaluaciones.length > 0 && (
          <>
            <UltimoPromedio evaluaciones={evaluaciones} />
            <GraficaTemporada evaluaciones={evaluaciones} />
            <Text style={estilos.seccion}>ÚLTIMAS EVALUACIONES ({evaluaciones.length})</Text>
            <TablaHistorial evaluaciones={recientesPrimero} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * El promedio de la última evaluación, tal como lo calculó el servidor, y
 * cuánto subió o bajó respecto a la anterior. La app no saca promedios propios.
 */
function UltimoPromedio({ evaluaciones }: { evaluaciones: Evaluacion[] }) {
  const ultima = evaluaciones[evaluaciones.length - 1];
  const anterior = evaluaciones.length > 1 ? evaluaciones[evaluaciones.length - 2] : null;
  const cambio = anterior ? Math.round((ultima.promedio - anterior.promedio) * 10) / 10 : null;

  let textoCambio = 'Primera evaluación';
  if (cambio !== null) {
    textoCambio = cambio === 0 ? 'Igual que la anterior' : `${cambio > 0 ? '+' : ''}${cambio.toFixed(1)} vs la anterior`;
  }

  return (
    <View style={estilos.tarjetaPromedio}>
      <View style={estilos.flex}>
        <Text style={estilos.promedioTitulo}>Último promedio</Text>
        <Text style={estilos.promedioNota}>
          {formatearFecha(ultima.fecha)} · {textoCambio}
        </Text>
      </View>
      <Text style={estilos.promedioValor}>{ultima.promedio.toFixed(1)}</Text>
    </View>
  );
}

/** Cómo ha ido cambiando: la gráfica de la temporada más reciente. */
function GraficaTemporada({ evaluaciones }: { evaluaciones: Evaluacion[] }) {
  const temporada = evaluaciones[evaluaciones.length - 1].temporada;
  const deLaTemporada = evaluaciones.filter((e) => e.temporada === temporada);
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.tarjetaTitulo}>
        Temporada {temporada} · {deLaTemporada.length} {deLaTemporada.length === 1 ? 'evaluación' : 'evaluaciones'}
      </Text>
      <GraficaLineas evaluaciones={deLaTemporada} />
      <View style={estilos.leyenda}>
        {SERIES.map((serie) => (
          <View key={serie.campo} style={estilos.leyendaDato}>
            <View style={[estilos.muestra, { backgroundColor: serie.color }]} />
            <Text style={estilos.leyendaTexto}>{serie.nombre}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 12, paddingBottom: 40 },
  nombre: { fontSize: 26, fontWeight: '900', color: Colores.texto },
  grupo: { fontSize: 16, color: Colores.textoSuave, marginTop: 2 },
  flex: { flex: 1 },
  enTelefono: {
    backgroundColor: Colores.blanco,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colores.morado,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  enTelefonoTitulo: { fontSize: 15, fontWeight: '800', color: Colores.morado },
  enTelefonoTexto: { fontSize: 15, color: Colores.texto },
  tarjetaPromedio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.morado,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  promedioTitulo: { fontSize: 17, fontWeight: '800', color: Colores.blanco },
  promedioNota: { fontSize: 14, color: '#D9D0EE', marginTop: 2 },
  promedioValor: { fontSize: 40, fontWeight: '900', color: Colores.menta },
  tarjeta: { backgroundColor: Colores.blanco, borderRadius: 16, padding: 16, gap: 12 },
  tarjetaTitulo: { fontSize: 15, fontWeight: '700', color: Colores.textoSuave },
  leyenda: { flexDirection: 'row', justifyContent: 'center', gap: 18 },
  leyendaDato: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muestra: { width: 18, height: 5, borderRadius: 3 },
  leyendaTexto: { fontSize: 14, fontWeight: '700', color: Colores.texto },
  seccion: { fontSize: 14, fontWeight: '800', color: Colores.morado, letterSpacing: 1, marginTop: 4 },
});
