import * as Crypto from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorApi } from '@/api/cliente';
import { enviarEvaluacion, MAX_OBSERVACIONES } from '@/api/entrenador';
import { AvisoError } from '@/components/AvisoError';
import { Boton } from '@/components/Boton';
import { BotonRegresar } from '@/components/BotonRegresar';
import { SelectorCalificacion } from '@/components/entrenador/SelectorCalificacion';
import { Colores } from '@/constants/colores';
import { fechaDeHoy, formatearFecha } from '@/utils/fechas';

type Problema = { titulo: string; mensaje: string };

// 06 · Captura de evaluación
export default function PantallaCaptura() {
  const params = useLocalSearchParams<{ alumno: string; nombre: string; grupoNombre?: string; evaluadoHoy?: string }>();

  // El client_uuid y la fecha se fijan UNA vez al abrir la captura. Si el
  // entrenador toca "Guardar" dos veces o reintenta tras un error de red, se
  // manda el mismo client_uuid y el servidor no duplica la evaluación.
  const [clientUuid] = useState(() => Crypto.randomUUID());
  const [fecha] = useState(fechaDeHoy);

  const [pase, setPase] = useState(5);
  const [recepcion, setRecepcion] = useState(5);
  const [tiro, setTiro] = useState(5);
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [problema, setProblema] = useState<Problema | null>(null);

  // Solo de referencia mientras se captura: el promedio bueno lo calcula el
  // servidor y es el que se muestra al guardar (regla 1).
  const promedioTentativo = Math.round(((pase + recepcion + tiro) / 3) * 10) / 10;

  async function guardar() {
    setGuardando(true);
    setProblema(null);
    try {
      const guardada = await enviarEvaluacion({
        client_uuid: clientUuid,
        alumno: Number(params.alumno),
        fecha,
        pase,
        recepcion,
        tiro,
        observaciones: observaciones.trim(),
      });
      // replace: al volver desde la confirmación se regresa a la lista, no a
      // este formulario ya guardado.
      router.replace({
        pathname: '/grupos/guardado',
        params: {
          nombre: guardada.alumno_nombre,
          pase: guardada.pase,
          recepcion: guardada.recepcion,
          tiro: guardada.tiro,
          promedio: guardada.promedio.toFixed(1),
        },
      });
    } catch (error) {
      setProblema(describirProblema(error));
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.filaArriba}>
            <BotonRegresar texto={params.grupoNombre?.split(' · ')[0] ?? 'Alumnos'} />
            <Text style={estilos.fecha}>{formatearFecha(fecha)}</Text>
          </View>

          <View>
            <Text style={estilos.nombre}>{params.nombre}</Text>
            <Text style={estilos.subtitulo}>Evaluación de hoy</Text>
          </View>

          {params.evaluadoHoy === 'si' && !problema && (
            <AvisoError
              titulo="Ya aparece evaluado hoy"
              mensaje="Solo se permite una evaluación por alumno y fecha; si la guardas, el servidor la va a rechazar."
            />
          )}

          <SelectorCalificacion nombre="Pase" valor={pase} onCambio={setPase} />
          <SelectorCalificacion nombre="Recepción" valor={recepcion} onCambio={setRecepcion} />
          <SelectorCalificacion nombre="Tiro" valor={tiro} onCambio={setTiro} />

          <View style={estilos.promedio}>
            <View style={estilos.promedioTextos}>
              <Text style={estilos.promedioTitulo}>Promedio tentativo</Text>
              <Text style={estilos.promedioNota}>El definitivo lo calcula el sistema · escala 1 a 10</Text>
            </View>
            <Text style={estilos.promedioValor}>{promedioTentativo.toFixed(1)}</Text>
          </View>

          <View style={estilos.observaciones}>
            <View style={estilos.filaArriba}>
              <Text style={estilos.etiqueta}>Observaciones</Text>
              <Text style={estilos.contador}>
                {observaciones.length}/{MAX_OBSERVACIONES}
              </Text>
            </View>
            <TextInput
              value={observaciones}
              onChangeText={setObservaciones}
              maxLength={MAX_OBSERVACIONES}
              multiline
              placeholder="Opcional. Lo verá la familia junto con tu nombre."
              placeholderTextColor={Colores.textoSuave}
              style={estilos.campo}
            />
          </View>

          {problema && <AvisoError titulo={problema.titulo} mensaje={problema.mensaje} />}

          <Boton titulo="Guardar" onPress={guardar} cargando={guardando} />
          {problema?.titulo === TITULO_CONFLICTO && (
            <Boton titulo="Volver a la lista" variante="contorno" onPress={() => router.back()} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const TITULO_CONFLICTO = 'Este alumno ya tiene evaluación de hoy';

/** Siempre se muestra el texto del servidor; el título solo da contexto. */
function describirProblema(error: unknown): Problema {
  if (!(error instanceof ErrorApi)) {
    return { titulo: 'No se guardó', mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.' };
  }
  // 409: el servidor dice quién la capturó y de qué fecha.
  if (error.status === 409) return { titulo: TITULO_CONFLICTO, mensaje: error.message };
  if (error.status === 0) return { titulo: 'Sin conexión: no se guardó', mensaje: error.message };
  return { titulo: 'El servidor no aceptó la evaluación', mensaje: error.message };
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 12, paddingBottom: 40 },
  filaArriba: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fecha: { fontSize: 15, color: Colores.textoSuave, fontWeight: '600' },
  nombre: { fontSize: 26, fontWeight: '900', color: Colores.texto },
  subtitulo: { fontSize: 16, color: Colores.textoSuave },
  promedio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.morado,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  promedioTextos: { flex: 1 },
  promedioTitulo: { fontSize: 17, fontWeight: '800', color: Colores.blanco },
  promedioNota: { fontSize: 13, color: '#D9D0EE', marginTop: 2 },
  promedioValor: { fontSize: 40, fontWeight: '900', color: Colores.menta },
  observaciones: { gap: 8 },
  etiqueta: { fontSize: 16, fontWeight: '800', color: Colores.texto },
  contador: { fontSize: 14, color: Colores.textoSuave },
  campo: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colores.borde,
    backgroundColor: Colores.blanco,
    padding: 14,
    fontSize: 17,
    color: Colores.texto,
    textAlignVertical: 'top',
  },
});
