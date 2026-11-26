import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AlumnoDelGrupo } from '@/api/entrenador';
import { Colores } from '@/constants/colores';

type Props = {
  alumno: AlumnoDelGrupo;
  /** Tiene una evaluación de hoy en la cola del teléfono, esperando señal. */
  enTelefono: boolean;
  onPress: () => void;
};

// Un alumno en la lista del grupo (05), con su marca de evaluación de hoy.
// Si el servidor ya la tiene, manda el servidor: "Evaluado" gana a "En teléfono".
export function FilaAlumno({ alumno, enTelefono, onPress }: Props) {
  const estado = alumno.evaluado_hoy ? ', ya evaluado hoy' : enTelefono ? ', guardado en el teléfono' : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Evaluar a ${alumno.nombre}${estado}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.fila, pressed && estilos.presionada]}>
      <View style={estilos.iniciales}>
        <Text style={estilos.inicialesTexto}>{iniciales(alumno.nombre)}</Text>
      </View>
      <Text style={estilos.nombre}>{alumno.nombre}</Text>
      {alumno.evaluado_hoy ? (
        <Text style={[estilos.marca, estilos.evaluado]}>✓ Evaluado</Text>
      ) : enTelefono ? (
        <Text style={[estilos.marca, estilos.enTelefono]}>◐ En teléfono</Text>
      ) : (
        <Text style={[estilos.marca, estilos.pendiente]}>Pendiente</Text>
      )}
    </Pressable>
  );
}

/** "Mateo Hernández Ruiz" → "MH" */
function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    backgroundColor: Colores.blanco,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  presionada: { opacity: 0.8 },
  iniciales: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicialesTexto: { fontSize: 14, fontWeight: '800', color: Colores.morado },
  nombre: { flex: 1, fontSize: 17, fontWeight: '700', color: Colores.texto },
  marca: { fontSize: 14, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, overflow: 'hidden' },
  evaluado: { backgroundColor: Colores.menta, color: Colores.moradoOscuro },
  enTelefono: { backgroundColor: Colores.fondo, borderWidth: 2, borderColor: Colores.morado, color: Colores.morado },
  pendiente: { borderWidth: 2, borderColor: Colores.borde, color: Colores.textoSuave },
});
