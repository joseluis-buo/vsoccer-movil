import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colores } from '@/constants/colores';
import type { Perfil } from '@/sesion/almacen';

// Cómo se lee cada rol de la API en pantalla.
const NOMBRE_DEL_ROL: Record<string, string> = {
  administrador: 'Administrador',
  secretaria: 'Secretaria',
  entrenador: 'Entrenador',
  tutor: 'Tutor',
};

type Props = { perfil: Perfil; color: string; colorTexto: string };

// Encabezado de las dos pantallas de Perfil. Todo sale de lo que mandó el
// login (nombre y roles), guardado en el teléfono: se ve igual sin señal.
export function EncabezadoPerfil({ perfil, color, colorTexto }: Props) {
  const roles = perfil.roles.map((rol) => NOMBRE_DEL_ROL[rol] ?? rol).join(' · ');
  return (
    <SafeAreaView edges={['top']} style={[estilos.encabezado, { backgroundColor: color }]}>
      <Text style={[estilos.titulo, { color: colorTexto }]}>Perfil</Text>
      <View style={estilos.fila}>
        <View style={estilos.iniciales}>
          <Text style={estilos.inicialesTexto}>{iniciales(perfil.nombre)}</Text>
        </View>
        <View style={estilos.datos}>
          <Text style={[estilos.nombre, { color: colorTexto }]}>{perfil.nombre}</Text>
          <Text style={[estilos.roles, { color: colorTexto }]}>{roles}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

/** Pie de las pantallas de Perfil, como en el prototipo. */
export function VersionDeLaApp() {
  return <Text style={estilos.version}>VIVA SOCCER Móvil · v{Constants.expoConfig?.version}</Text>;
}

/** "Laura Hernández" → "LH" */
function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0] ?? '')
    .join('')
    .toUpperCase();
}

const estilos = StyleSheet.create({
  encabezado: { paddingHorizontal: 24, paddingBottom: 24, gap: 14 },
  titulo: { fontSize: 30, fontWeight: '900', marginTop: 16 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iniciales: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colores.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicialesTexto: { fontSize: 22, fontWeight: '900', color: Colores.morado },
  datos: { flex: 1 },
  nombre: { fontSize: 22, fontWeight: '900' },
  roles: { fontSize: 16, fontWeight: '600', opacity: 0.85 },
  version: { fontSize: 13, color: Colores.textoSuave, textAlign: 'center', marginTop: 8 },
});
