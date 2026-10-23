import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colores } from '@/constants/colores';

type Props = {
  /** Número de la pantalla en el prototipo, p. ej. "05". */
  numero?: string;
  titulo: string;
  children?: ReactNode;
};

// Marcador para las pantallas que todavía no se implementan.
export function PantallaVacia({ numero, titulo, children }: Props) {
  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <Text style={estilos.titulo}>{numero ? `${numero} · ${titulo}` : titulo}</Text>
      <Text style={estilos.nota}>Pendiente de implementar</Text>
      {children ? <View style={estilos.extra}>{children}</View> : null}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo, padding: 24 },
  titulo: { fontSize: 26, fontWeight: '800', color: Colores.texto, marginTop: 16 },
  nota: { fontSize: 16, color: Colores.textoSuave, marginTop: 8 },
  extra: { marginTop: 32 },
});
