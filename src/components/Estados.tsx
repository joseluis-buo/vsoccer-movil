import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colores } from '@/constants/colores';

import { AvisoError } from './AvisoError';
import { Boton } from './Boton';

// Los tres estados que toda pantalla con datos debe mostrar (nunca en blanco).

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={Colores.morado} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

export function Vacio({ titulo, explicacion }: { titulo: string; explicacion: string }) {
  return (
    <View style={estilos.centro}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{explicacion}</Text>
    </View>
  );
}

/** Muestra el mensaje que mandó el servidor y un botón para volver a pedir. */
export function ErrorConReintento({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <View style={estilos.error}>
      <AvisoError titulo="No se pudo cargar" mensaje={mensaje} />
      <Boton titulo="Reintentar" onPress={onReintentar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 12 },
  titulo: { fontSize: 20, fontWeight: '800', color: Colores.texto, textAlign: 'center' },
  texto: { fontSize: 16, color: Colores.textoSuave, textAlign: 'center', lineHeight: 22 },
  error: { paddingVertical: 24, gap: 16 },
});
