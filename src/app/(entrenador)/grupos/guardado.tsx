import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { Colores } from '@/constants/colores';

// 07a · Guardado y sincronizado. Los números son los que regresó el servidor,
// incluido el promedio oficial.
export default function PantallaGuardado() {
  const { nombre, pase, recepcion, tiro, promedio } = useLocalSearchParams<{
    nombre: string;
    pase: string;
    recepcion: string;
    tiro: string;
    promedio: string;
  }>();

  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={estilos.centro}>
        <View style={estilos.palomita}>
          <Text style={estilos.palomitaTexto}>✓</Text>
        </View>
        <Text style={estilos.titulo}>Guardado y sincronizado</Text>
        <Text style={estilos.texto}>La evaluación de {nombre} ya está en el sistema de la escuela.</Text>

        <View style={estilos.resumen}>
          <Dato etiqueta="Pase" valor={pase} />
          <Dato etiqueta="Recep." valor={recepcion} />
          <Dato etiqueta="Tiro" valor={tiro} />
          <Dato etiqueta="Prom." valor={promedio} destacado />
        </View>
      </View>

      {/* La captura se reemplazó por esta pantalla, así que "atrás" es la lista. */}
      <Boton titulo="Volver a la lista" onPress={() => router.back()} />
    </SafeAreaView>
  );
}

function Dato({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <View style={estilos.dato}>
      <Text style={estilos.datoEtiqueta}>{etiqueta}</Text>
      <Text style={[estilos.datoValor, destacado && estilos.destacado]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo, padding: 24 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  palomita: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colores.menta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palomitaTexto: { fontSize: 56, fontWeight: '900', color: Colores.moradoOscuro },
  titulo: { fontSize: 28, fontWeight: '900', color: Colores.texto, textAlign: 'center' },
  texto: { fontSize: 17, color: Colores.textoSuave, textAlign: 'center', lineHeight: 24 },
  resumen: {
    flexDirection: 'row',
    backgroundColor: Colores.blanco,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  dato: { flex: 1, alignItems: 'center', gap: 2 },
  datoEtiqueta: { fontSize: 13, color: Colores.textoSuave },
  datoValor: { fontSize: 24, fontWeight: '900', color: Colores.texto },
  destacado: { color: Colores.morado },
});
