import * as Crypto from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MAX_OBSERVACIONES, type NuevaEvaluacion } from '@/api/entrenador';
import { guardarEnCola, quitarDeCola } from '@/cola/cola';
import { enviarDeLaCola, enviarPendientes, type ResultadoEnvio } from '@/cola/envio';
import { AvisoError } from '@/components/AvisoError';
import { Boton } from '@/components/Boton';
import { BotonRegresar } from '@/components/BotonRegresar';
import { SelectorCalificacion } from '@/components/entrenador/SelectorCalificacion';
import { Colores } from '@/constants/colores';
import { useSesion } from '@/sesion/SesionContext';
import { fechaDeHoy, formatearFecha } from '@/utils/fechas';

type Problema = { titulo: string; mensaje: string };

// 06 · Captura de evaluación
export default function PantallaCaptura() {
  const params = useLocalSearchParams<{
    alumno: string;
    nombre: string;
    grupoNombre?: string;
    /** 'si' = el servidor ya la tiene · 'telefono' = hay una en la cola esperando señal */
    evaluadoHoy?: 'si' | 'telefono' | 'no';
  }>();
  const { perfil } = useSesion();
  const usuario = perfil?.usuario ?? '';

  // El client_uuid y la fecha se fijan UNA vez al abrir la captura. Si el
  // entrenador toca "Guardar" dos veces o la evaluación se reenvía desde la
  // cola, va el mismo client_uuid y el servidor no la duplica.
  const [clientUuid] = useState(() => Crypto.randomUUID());
  const [fecha] = useState(fechaDeHoy);

  const [pase, setPase] = useState(5);
  const [recepcion, setRecepcion] = useState(5);
  const [tiro, setTiro] = useState(5);
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [problema, setProblema] = useState<Problema | null>(null);
  // Motivo con el que el servidor rechazó esta evaluación (409, fecha vieja…).
  const [rechazo, setRechazo] = useState<string | null>(null);

  // Solo de referencia mientras se captura: el promedio bueno lo calcula el
  // servidor y es el que se muestra al guardar (regla 1).
  const promedioTentativo = Math.round(((pase + recepcion + tiro) / 3) * 10) / 10;

  async function guardar() {
    setGuardando(true);
    setProblema(null);
    const evaluacion: NuevaEvaluacion = {
      client_uuid: clientUuid,
      alumno: Number(params.alumno),
      fecha,
      pase,
      recepcion,
      tiro,
      observaciones: observaciones.trim(),
    };

    // 1. Primero al teléfono, siempre (regla 2). Si esto falla no hay nada
    //    guardado y se avisa; la red ni se intenta.
    try {
      await guardarEnCola(usuario, evaluacion, params.nombre);
    } catch (error) {
      setProblema({ titulo: 'No se pudo guardar en el teléfono', mensaje: (error as Error).message });
      setGuardando(false);
      return;
    }

    // 2. Ya está a salvo. Ahora sí se intenta mandar.
    let resultado: ResultadoEnvio;
    try {
      resultado = await enviarDeLaCola(usuario, evaluacion);
    } catch {
      // Falló SQLite al anotar el intento: la evaluación sigue en la cola
      // como pendiente, así que se trata igual que "sin señal".
      resultado = { tipo: 'pendiente', sinSenal: false, motivo: '' };
    }

    // replace: al volver desde la confirmación se regresa a la lista, no a
    // este formulario ya guardado.
    if (resultado.tipo === 'enviada') {
      // Si esta llegó, hay señal: se aprovecha para mandar las que esperaban.
      enviarPendientes(usuario).catch(() => {});
      const { guardada } = resultado;
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
    } else if (resultado.tipo === 'pendiente') {
      router.replace({
        pathname: '/grupos/sin-conexion',
        params: { nombre: params.nombre, sinSenal: resultado.sinSenal ? 'si' : 'no' },
      });
    } else {
      setRechazo(resultado.motivo);
      setGuardando(false);
    }
  }

  async function descartar() {
    await quitarDeCola(usuario, clientUuid).catch(() => {});
    router.back();
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

          {params.evaluadoHoy === 'si' && !rechazo && (
            <AvisoError
              titulo="Ya aparece evaluado hoy"
              mensaje="Solo se permite una evaluación por alumno y fecha; si la guardas, el servidor la va a rechazar."
            />
          )}
          {params.evaluadoHoy === 'telefono' && !rechazo && (
            <AvisoError
              titulo="Ya tiene una evaluación en el teléfono"
              mensaje="Está guardada esperando señal. Si capturas otra, el servidor rechazará la segunda."
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

          {rechazo ? (
            // Reintentar daría el mismo "no": el entrenador decide qué hacer.
            <>
              <AvisoError titulo="El servidor rechazó la evaluación" mensaje={rechazo} />
              <Text style={estilos.nota}>
                Quedó en la pestaña Sincronizar como rechazada. Puedes descartarla ahora o revisarla después.
              </Text>
              <Boton titulo="Descartar evaluación" onPress={descartar} />
              <Boton titulo="Dejarla en Sincronizar" variante="contorno" onPress={() => router.back()} />
            </>
          ) : (
            <Boton titulo="Guardar" onPress={guardar} cargando={guardando} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
  nota: { fontSize: 15, color: Colores.textoSuave, lineHeight: 21 },
});
