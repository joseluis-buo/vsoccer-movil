import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pedirMisHijos } from '@/api/familia';
import { useDatos } from '@/api/useDatos';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { Progresion } from '@/components/familia/Progresion';
import { Colores } from '@/constants/colores';

// 11 · Progresión desde la pestaña "Progreso": primero se elige al hijo
// (si solo hay uno, se muestra directo) y luego su gráfica.
export default function PantallaProgreso() {
  const { estado, reintentar } = useDatos(pedirMisHijos);
  const [elegido, setElegido] = useState<number | null>(null);

  let contenido;
  if (estado.tipo === 'cargando') {
    contenido = <Cargando />;
  } else if (estado.tipo === 'error') {
    contenido = <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />;
  } else if (estado.datos.length === 0) {
    contenido = (
      <Vacio
        titulo="Aún no hay alumnos en tu cuenta"
        explicacion="Cuando la escuela vincule a tu hijo con tu número, aquí verás cómo avanza."
      />
    );
  } else {
    const hijos = estado.datos;
    const hijo = hijos.find((h) => h.id === elegido) ?? hijos[0];
    contenido = (
      <>
        {hijos.length > 1 && (
          <View style={estilos.selector}>
            {hijos.map((h) => (
              <Pressable
                key={h.id}
                accessibilityRole="button"
                accessibilityState={{ selected: h.id === hijo.id }}
                onPress={() => setElegido(h.id)}
                style={[estilos.chip, h.id === hijo.id && estilos.chipActivo]}>
                <Text style={[estilos.chipTexto, h.id === hijo.id && estilos.chipTextoActivo]}>
                  {h.nombre.split(' ')[0]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <Text style={estilos.nombre}>{hijo.nombre}</Text>
        <Progresion key={hijo.id} alumnoId={hijo.id} />
      </>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.titulo}>Progresión</Text>
        {contenido}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 14, paddingBottom: 40 },
  titulo: { fontSize: 30, fontWeight: '900', color: Colores.texto, marginTop: 8 },
  nombre: { fontSize: 20, fontWeight: '800', color: Colores.texto },
  selector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colores.menta,
    backgroundColor: Colores.blanco,
    justifyContent: 'center',
  },
  chipActivo: { backgroundColor: Colores.menta },
  chipTexto: { fontSize: 16, fontWeight: '700', color: Colores.moradoOscuro },
  chipTextoActivo: { fontWeight: '900' },
});
