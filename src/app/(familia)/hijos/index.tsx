import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pedirMisHijos, type Hijo } from '@/api/familia';
import { useDatos } from '@/api/useDatos';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { TarjetaHijo } from '@/components/familia/TarjetaHijo';
import { Colores } from '@/constants/colores';
import { useSesion } from '@/sesion/SesionContext';

// 09 · Mis hijos
export default function PantallaMisHijos() {
  const { perfil } = useSesion();
  const { estado, reintentar } = useDatos(pedirMisHijos);

  function abrirFicha(hijo: Hijo) {
    // Nombre y grupo viajan en la ruta para pintar el encabezado de la ficha
    // en cuanto se abre, sin esperar al servidor.
    router.push({
      pathname: '/hijos/alumno/[id]',
      params: { id: hijo.id, nombre: hijo.nombre, grupo: `${hijo.categoria_nombre} · ${hijo.horario_nombre}` },
    });
  }

  return (
    <View style={estilos.pantalla}>
      <SafeAreaView edges={['top']} style={estilos.encabezado}>
        <Text style={estilos.saludo}>Hola, {perfil?.nombre}</Text>
        <Text style={estilos.titulo}>Mis hijos</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={estilos.contenido}>
        {estado.tipo === 'cargando' && <Cargando texto="Buscando a tus hijos…" />}
        {estado.tipo === 'error' && <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && estado.datos.length === 0 && (
          <Vacio
            titulo="Aún no hay alumnos en tu cuenta"
            explicacion="La escuela todavía no vincula a ningún alumno contigo. Pide en recepción que lo registren con tu número."
          />
        )}
        {estado.tipo === 'listo' &&
          activosPrimero(estado.datos).map((hijo) => (
            <TarjetaHijo key={hijo.id} hijo={hijo} onPress={() => abrirFicha(hijo)} />
          ))}
      </ScrollView>
    </View>
  );
}

// La API ya los manda así; se asegura aquí porque es lo que pide la pantalla.
// Mantiene el orden del servidor dentro de cada grupo.
function activosPrimero(hijos: Hijo[]) {
  return [...hijos.filter((h) => h.activo), ...hijos.filter((h) => !h.activo)];
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  encabezado: { backgroundColor: Colores.menta, paddingHorizontal: 24, paddingBottom: 24 },
  saludo: { fontSize: 17, fontWeight: '600', color: Colores.moradoOscuro, marginTop: 16 },
  titulo: { fontSize: 32, fontWeight: '900', color: Colores.moradoOscuro },
  contenido: { padding: 20, gap: 14 },
});
