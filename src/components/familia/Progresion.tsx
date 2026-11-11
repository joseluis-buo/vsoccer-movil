import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { historialGuardadoOPedir, type Evaluacion } from '@/api/familia';
import { useDatos } from '@/api/useDatos';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { Colores } from '@/constants/colores';

import { GraficaLineas, SERIES } from './GraficaLineas';

// 11 · Progresión por temporada. Usa el mismo histórico de la ficha; si la
// ficha ya lo pidió, no se vuelve a pedir.
export function Progresion({ alumnoId }: { alumnoId: number }) {
  const { estado, reintentar } = useDatos(() => historialGuardadoOPedir(alumnoId), alumnoId);
  // null = la temporada más reciente
  const [elegida, setElegida] = useState<number | null>(null);

  if (estado.tipo === 'cargando') return <Cargando texto="Cargando progresión…" />;
  if (estado.tipo === 'error') return <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />;

  const evaluaciones = estado.datos.evaluaciones;
  if (evaluaciones.length === 0) {
    return (
      <Vacio
        titulo="Todavía no lo evalúan"
        explicacion="La gráfica aparece en cuanto su entrenador capture la primera evaluación."
      />
    );
  }

  // Temporadas sin repetir, la más nueva primero.
  const temporadas = [...new Set(evaluaciones.map((e) => e.temporada))].sort((a, b) => b - a);
  const temporada = elegida !== null && temporadas.includes(elegida) ? elegida : temporadas[0];
  const deLaTemporada = evaluaciones.filter((e) => e.temporada === temporada);

  return (
    <View style={estilos.contenedor}>
      {temporadas.length > 1 && (
        <View style={estilos.selector}>
          {temporadas.map((t) => (
            <Pressable
              key={t}
              accessibilityRole="button"
              accessibilityState={{ selected: t === temporada }}
              onPress={() => setElegida(t)}
              style={[estilos.chip, t === temporada && estilos.chipActivo]}>
              <Text style={[estilos.chipTexto, t === temporada && estilos.chipTextoActivo]}>Temporada {t}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>
          Temporada {temporada} · {deLaTemporada.length} {deLaTemporada.length === 1 ? 'evaluación' : 'evaluaciones'}
        </Text>
        <GraficaLineas evaluaciones={deLaTemporada} />
      </View>

      {SERIES.map((serie) => (
        <Resumen key={serie.campo} nombre={serie.nombre} color={serie.color} evaluaciones={deLaTemporada} campo={serie.campo} />
      ))}
    </View>
  );
}

/** Leyenda de cada línea: de cuánto a cuánto fue en la temporada. */
function Resumen({
  nombre,
  color,
  evaluaciones,
  campo,
}: {
  nombre: string;
  color: string;
  evaluaciones: Evaluacion[];
  campo: (typeof SERIES)[number]['campo'];
}) {
  const inicio = evaluaciones[0][campo];
  const fin = evaluaciones[evaluaciones.length - 1][campo];
  const cambio = fin - inicio;
  return (
    <View style={estilos.resumen}>
      <View style={[estilos.muestra, { backgroundColor: color }]} />
      <Text style={estilos.resumenNombre}>{nombre}</Text>
      <Text style={estilos.resumenValores}>
        {inicio} → {fin}
      </Text>
      <Text style={estilos.resumenCambio}>{cambio > 0 ? `+${cambio}` : cambio}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 12 },
  selector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colores.borde,
    backgroundColor: Colores.blanco,
    justifyContent: 'center',
  },
  chipActivo: { backgroundColor: Colores.moradoOscuro, borderColor: Colores.moradoOscuro },
  chipTexto: { fontSize: 16, fontWeight: '700', color: Colores.textoSuave },
  chipTextoActivo: { color: Colores.blanco },
  tarjeta: { backgroundColor: Colores.blanco, borderRadius: 18, padding: 16, gap: 12 },
  titulo: { fontSize: 16, fontWeight: '700', color: Colores.textoSuave },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.blanco,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  muestra: { width: 22, height: 5, borderRadius: 3 },
  resumenNombre: { flex: 1, fontSize: 17, fontWeight: '700', color: Colores.texto },
  resumenValores: { fontSize: 17, color: Colores.textoSuave },
  resumenCambio: { width: 36, textAlign: 'right', fontSize: 17, fontWeight: '800', color: Colores.texto },
});
