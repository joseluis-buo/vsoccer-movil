import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pedirHistorial } from '@/api/familia';
import { useDatos } from '@/api/useDatos';
import { Boton } from '@/components/Boton';
import { BotonRegresar } from '@/components/BotonRegresar';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { FilaHistorial } from '@/components/familia/FilaHistorial';
import { UltimaEvaluacion } from '@/components/familia/UltimaEvaluacion';
import { Colores } from '@/constants/colores';

// 10 · Ficha del alumno (modo Familia)
export default function PantallaFichaFamilia() {
  const { id, nombre, grupo } = useLocalSearchParams<{ id: string; nombre?: string; grupo?: string }>();
  const alumnoId = Number(id);
  // Si no es hijo del tutor, la API responde 404 y se muestra su mensaje.
  const { estado, reintentar } = useDatos(() => pedirHistorial(alumnoId), alumnoId);

  // La API las manda de la más vieja a la más nueva; aquí se ven al revés.
  const evaluaciones = estado.tipo === 'listo' ? [...estado.datos.evaluaciones].reverse() : [];
  const nombreVisible = estado.tipo === 'listo' ? estado.datos.alumno.nombre : nombre;

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <BotonRegresar texto="Mis hijos" />
        <View>
          <Text style={estilos.nombre}>{nombreVisible ?? 'Ficha del alumno'}</Text>
          {grupo ? <Text style={estilos.grupo}>{grupo}</Text> : null}
        </View>

        {estado.tipo === 'cargando' && <Cargando texto="Cargando evaluaciones…" />}
        {estado.tipo === 'error' && <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && evaluaciones.length === 0 && (
          <Vacio
            titulo="Todavía no lo evalúan"
            explicacion="Cuando su entrenador capture la primera evaluación en la cancha, aparecerá aquí con sus calificaciones."
          />
        )}

        {evaluaciones.length > 0 && (
          <>
            <UltimaEvaluacion evaluacion={evaluaciones[0]} />
            <Boton
              titulo="Ver progresión por temporada"
              variante="menta"
              onPress={() =>
                router.push({ pathname: '/hijos/progresion/[id]', params: { id: alumnoId, nombre: nombreVisible } })
              }
            />
            <Text style={estilos.subtitulo}>Histórico ({evaluaciones.length})</Text>
            {evaluaciones.map((evaluacion) => (
              <FilaHistorial key={evaluacion.id} evaluacion={evaluacion} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 14, paddingBottom: 40 },
  nombre: { fontSize: 28, fontWeight: '900', color: Colores.texto },
  grupo: { fontSize: 16, color: Colores.textoSuave, marginTop: 2 },
  subtitulo: { fontSize: 20, fontWeight: '800', color: Colores.texto, marginTop: 10 },
});
