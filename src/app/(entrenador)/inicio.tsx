import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListaDeGrupos } from '@/components/entrenador/ListaDeGrupos';
import { TarjetaPendientes } from '@/components/entrenador/TarjetaPendientes';
import { Colores } from '@/constants/colores';
import { useSesion } from '@/sesion/SesionContext';
import { hoyEnTexto } from '@/utils/fechas';

// 04 · Inicio del entrenador: fecha de hoy y sus grupos.
export default function PantallaInicio() {
  const { perfil } = useSesion();

  return (
    <View style={estilos.pantalla}>
      <SafeAreaView edges={['top']} style={estilos.encabezado}>
        <Text style={estilos.fecha}>{hoyEnTexto()}</Text>
        <Text style={estilos.saludo}>Hola, {perfil?.nombre}</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={estilos.contenido}>
        <TarjetaPendientes />
        <Text style={estilos.seccion}>MIS GRUPOS</Text>
        <ListaDeGrupos />
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  encabezado: { backgroundColor: Colores.morado, paddingHorizontal: 24, paddingBottom: 24 },
  fecha: { fontSize: 15, fontWeight: '700', color: Colores.menta, marginTop: 16 },
  saludo: { fontSize: 28, fontWeight: '900', color: Colores.blanco },
  contenido: { padding: 20, gap: 12 },
  seccion: { fontSize: 14, fontWeight: '800', color: Colores.morado, letterSpacing: 1 },
});
