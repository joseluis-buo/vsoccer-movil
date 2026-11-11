import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Grupo } from '@/api/entrenador';
import { Colores } from '@/constants/colores';

// Tarjeta de un grupo en el Inicio (04). "Mini · Lunes y Miércoles" se parte
// en dos renglones: la categoría grande y el horario abajo.
export function TarjetaGrupo({ grupo, onPress }: { grupo: Grupo; onPress: () => void }) {
  const [categoria, horario] = grupo.nombre.split(' · ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir grupo ${grupo.nombre}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}>
      <View style={estilos.datos}>
        <Text style={estilos.categoria}>{categoria}</Text>
        <Text style={estilos.horario}>{horario ?? grupo.grupo}</Text>
      </View>
      <View style={estilos.conteo}>
        <Text style={estilos.numero}>{grupo.alumnos}</Text>
        <Text style={estilos.etiqueta}>{grupo.alumnos === 1 ? 'alumno' : 'alumnos'}</Text>
      </View>
      <Text style={estilos.flecha}>›</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 84,
    backgroundColor: Colores.blanco,
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: Colores.borde,
  },
  presionada: { opacity: 0.8 },
  datos: { flex: 1, gap: 2 },
  categoria: { fontSize: 22, fontWeight: '900', color: Colores.morado },
  horario: { fontSize: 16, color: Colores.textoSuave },
  conteo: { alignItems: 'center' },
  numero: { fontSize: 24, fontWeight: '900', color: Colores.texto },
  etiqueta: { fontSize: 13, color: Colores.textoSuave },
  flecha: { fontSize: 32, color: Colores.morado, fontWeight: '700' },
});
