import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { quitarDeCola } from '@/cola/cola';
import { useCola } from '@/cola/useCola';
import { useEnvioManual } from '@/cola/useEnvioManual';
import { AvisoError } from '@/components/AvisoError';
import { Boton } from '@/components/Boton';
import { FilaCola } from '@/components/entrenador/FilaCola';
import { Vacio } from '@/components/Estados';
import { Colores } from '@/constants/colores';

// Pestaña Sincronizar: lo que está guardado en el teléfono y no ha llegado
// al servidor. Las pendientes se reintentan; las rechazadas se descartan.
export default function PantallaSincronizar() {
  const { usuario, pendientes, rechazadas, error } = useCola();
  const { enviando, resultado, enviar } = useEnvioManual(usuario, pendientes.length);

  // La cola avisa del cambio y la lista se actualiza sola.
  async function descartar(clientUuid: string) {
    await quitarDeCola(usuario, clientUuid).catch(() => {});
  }

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.titulo}>Sincronizar</Text>

        {error && <AvisoError titulo="Problema con el teléfono" mensaje={error} />}
        {resultado && <Text style={estilos.resultado}>{resultado}</Text>}

        {pendientes.length === 0 && rechazadas.length === 0 && !error && (
          <Vacio
            titulo="Todo está sincronizado"
            explicacion="No hay evaluaciones guardadas en el teléfono esperando a llegar al servidor."
          />
        )}

        {pendientes.length > 0 && (
          <>
            <Text style={estilos.seccion}>PENDIENTES DE ENVIAR ({pendientes.length})</Text>
            <Boton titulo="Reintentar todas" onPress={enviar} cargando={enviando} />
            {pendientes.map((evaluacion) => (
              <FilaCola key={evaluacion.client_uuid} evaluacion={evaluacion} />
            ))}
          </>
        )}

        {rechazadas.length > 0 && (
          <>
            <Text style={estilos.seccion}>RECHAZADAS POR EL SERVIDOR ({rechazadas.length})</Text>
            <Text style={estilos.nota}>
              Reenviarlas daría el mismo resultado. Revisa el motivo y descártalas cuando lo hayas visto.
            </Text>
            {rechazadas.map((evaluacion) => (
              <FilaCola
                key={evaluacion.client_uuid}
                evaluacion={evaluacion}
                onDescartar={() => descartar(evaluacion.client_uuid)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 12, paddingBottom: 40 },
  titulo: { fontSize: 32, fontWeight: '900', color: Colores.texto, marginTop: 8 },
  seccion: { fontSize: 14, fontWeight: '800', color: Colores.morado, letterSpacing: 1, marginTop: 8 },
  nota: { fontSize: 15, color: Colores.textoSuave, lineHeight: 21 },
  resultado: {
    fontSize: 16,
    fontWeight: '700',
    color: Colores.texto,
    backgroundColor: Colores.blanco,
    borderRadius: 12,
    padding: 14,
  },
});
