import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotonRegresar } from '@/components/BotonRegresar';
import { Progresion } from '@/components/familia/Progresion';
import { Colores } from '@/constants/colores';

// 11 · Progresión, abierta desde la ficha del alumno.
export default function PantallaProgresionAlumno() {
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre?: string }>();

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <BotonRegresar texto={nombre ?? 'Ficha'} />
        <Text style={estilos.titulo}>Progresión</Text>
        <Progresion alumnoId={Number(id)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 14, paddingBottom: 40 },
  titulo: { fontSize: 30, fontWeight: '900', color: Colores.texto },
});
