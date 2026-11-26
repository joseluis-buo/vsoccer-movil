import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCola } from '@/cola/useCola';
import { Boton } from '@/components/Boton';
import { Colores } from '@/constants/colores';

// 07b · Guardado sin conexión. La evaluación ya está en SQLite; aquí solo se
// avisa y se dice cuántas esperan señal (se lee de la cola, no de la ruta).
export default function PantallaSinConexion() {
  const { nombre, sinSenal } = useLocalSearchParams<{ nombre: string; sinSenal?: 'si' | 'no' }>();
  const { pendientes } = useCola();

  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={estilos.centro}>
        <Text style={estilos.etiqueta}>{sinSenal === 'no' ? 'Servidor no disponible' : 'Sin conexión'}</Text>
        <View style={estilos.circulo}>
          <Text style={estilos.flecha}>↑</Text>
        </View>
        <Text style={estilos.titulo}>Guardado en el teléfono</Text>
        <Text style={estilos.texto}>
          La evaluación de {nombre} no se perdió. Cuando haya señal, envíala desde Sincronizar o con «Enviar» en
          Inicio.
        </Text>
        <Text style={estilos.texto}>
          Si cierras sesión, se queda en el teléfono hasta que vuelvas a entrar con tu cuenta.
        </Text>

        <View style={estilos.pendientes}>
          <Text style={estilos.pendientesTexto}>Pendientes de enviar</Text>
          <Text style={estilos.pendientesNumero}>{pendientes.length}</Text>
        </View>
      </View>

      {/* La captura se reemplazó por esta pantalla, así que "atrás" es la lista. */}
      <Boton titulo="Volver a la lista" onPress={() => router.back()} />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo, padding: 24 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  etiqueta: {
    fontSize: 14,
    fontWeight: '800',
    color: Colores.blanco,
    backgroundColor: Colores.moradoOscuro,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  // Línea punteada: lo mismo que el camino "sin conexión" del prototipo.
  circulo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: Colores.morado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flecha: { fontSize: 52, fontWeight: '900', color: Colores.morado },
  titulo: { fontSize: 28, fontWeight: '900', color: Colores.texto, textAlign: 'center' },
  texto: { fontSize: 17, color: Colores.textoSuave, textAlign: 'center', lineHeight: 24 },
  pendientes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    backgroundColor: Colores.blanco,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },
  pendientesTexto: { fontSize: 17, fontWeight: '700', color: Colores.texto },
  pendientesNumero: { fontSize: 26, fontWeight: '900', color: Colores.morado },
});
