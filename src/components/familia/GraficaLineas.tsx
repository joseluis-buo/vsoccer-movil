import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Evaluacion } from '@/api/familia';
import { Colores } from '@/constants/colores';
import { formatearFecha } from '@/utils/fechas';

// Gráfica de líneas dibujada solo con <View>, sin librería de gráficas
// (react-native-svg no está instalado). Cada punto es un círculo y cada
// tramo de línea es un rectángulo delgado, girado para unir dos puntos.

export const SERIES = [
  { campo: 'pase', nombre: 'Pase', color: Colores.morado },
  { campo: 'recepcion', nombre: 'Recepción', color: Colores.mentaOscuro },
  { campo: 'tiro', nombre: 'Tiro', color: Colores.naranja },
] as const;

const ALTO = 200;
const MARGEN_IZQ = 28; // espacio para los números del eje vertical
const MARGEN = 10; // para que los puntos de las orillas no se corten
const GROSOR = 3;
const PUNTO = 10;
const LINEAS_GUIA = [2, 4, 6, 8, 10];

type Punto = { x: number; y: number };

/** `evaluaciones` de una sola temporada, de la más vieja a la más nueva. */
export function GraficaLineas({ evaluaciones }: { evaluaciones: Evaluacion[] }) {
  const [ancho, setAncho] = useState(0);
  const anchoUtil = ancho - MARGEN_IZQ - MARGEN * 2;
  const altoUtil = ALTO - MARGEN * 2;

  // Calificación 0–10 → píxeles. En pantalla la y crece hacia abajo.
  const y = (valor: number) => MARGEN + altoUtil * (1 - valor / 10);
  const x = (i: number) =>
    MARGEN_IZQ + MARGEN + (evaluaciones.length === 1 ? anchoUtil / 2 : (anchoUtil * i) / (evaluaciones.length - 1));

  return (
    <View>
      <View style={{ height: ALTO }} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
        {LINEAS_GUIA.map((valor) => (
          <View key={valor} style={[estilos.guia, { top: y(valor), left: MARGEN_IZQ }]}>
            <Text style={estilos.numeroGuia}>{valor}</Text>
          </View>
        ))}

        {ancho > 0 &&
          SERIES.map((serie) => {
            const puntos = evaluaciones.map((ev, i) => ({ x: x(i), y: y(ev[serie.campo]) }));
            return (
              <View key={serie.campo} style={StyleSheet.absoluteFill} pointerEvents="none">
                {puntos.slice(1).map((punto, i) => (
                  <Tramo key={i} desde={puntos[i]} hasta={punto} color={serie.color} />
                ))}
                {puntos.map((punto, i) => (
                  <View
                    key={i}
                    style={[
                      estilos.punto,
                      { left: punto.x - PUNTO / 2, top: punto.y - PUNTO / 2, backgroundColor: serie.color },
                    ]}
                  />
                ))}
              </View>
            );
          })}
      </View>

      <EjeFechas evaluaciones={evaluaciones} />
    </View>
  );
}

/** Rectángulo de largo = distancia entre los puntos, centrado entre ellos y girado al ángulo que los une. */
function Tramo({ desde, hasta, color }: { desde: Punto; hasta: Punto; color: string }) {
  const dx = hasta.x - desde.x;
  const dy = hasta.y - desde.y;
  const largo = Math.sqrt(dx * dx + dy * dy);
  const angulo = Math.atan2(dy, dx);
  return (
    <View
      style={{
        position: 'absolute',
        width: largo,
        height: GROSOR,
        borderRadius: GROSOR / 2,
        backgroundColor: color,
        left: (desde.x + hasta.x) / 2 - largo / 2,
        top: (desde.y + hasta.y) / 2 - GROSOR / 2,
        transform: [{ rotate: `${angulo}rad` }],
      }}
    />
  );
}

/** Primera y última fecha (y la de en medio si hay más de dos), como en el prototipo. */
function EjeFechas({ evaluaciones }: { evaluaciones: Evaluacion[] }) {
  const primera = evaluaciones[0];
  const ultima = evaluaciones[evaluaciones.length - 1];
  const media = evaluaciones.length > 2 ? evaluaciones[Math.floor(evaluaciones.length / 2)] : null;
  return (
    <View style={estilos.eje}>
      <Text style={estilos.fecha}>{formatearFecha(primera.fecha, false)}</Text>
      {media ? <Text style={estilos.fecha}>{formatearFecha(media.fecha, false)}</Text> : null}
      {ultima !== primera ? <Text style={estilos.fecha}>{formatearFecha(ultima.fecha, false)}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  guia: { position: 'absolute', right: 0, height: 1, backgroundColor: Colores.borde },
  numeroGuia: { position: 'absolute', left: -MARGEN_IZQ, top: -9, width: 22, textAlign: 'right', fontSize: 12, color: Colores.textoSuave },
  punto: { position: 'absolute', width: PUNTO, height: PUNTO, borderRadius: PUNTO / 2 },
  eje: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: MARGEN_IZQ, marginTop: 6 },
  fecha: { fontSize: 13, color: Colores.textoSuave },
});
