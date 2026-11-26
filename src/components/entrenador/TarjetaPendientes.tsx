import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { enviarPendientes, textoDelResumen } from '@/cola/envio';
import { useCola } from '@/cola/useCola';
import { Colores } from '@/constants/colores';

// Tarjeta del Inicio (04): "Evaluaciones pendientes de sincronizar · Enviar".
// Solo aparece si hay algo en la cola. Tocarla lleva a Sincronizar.
export function TarjetaPendientes() {
  const { usuario, pendientes, rechazadas, recargar } = useCola();
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  if (pendientes.length === 0 && rechazadas.length === 0 && !resultado) return null;

  async function enviar() {
    setEnviando(true);
    try {
      setResultado(textoDelResumen(await enviarPendientes(usuario)));
    } catch (e) {
      setResultado(`No se pudo enviar: ${(e as Error).message}`);
    }
    setEnviando(false);
    recargar();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ver evaluaciones guardadas en el teléfono"
      onPress={() => router.push('/sincronizar')}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}>
      <View style={estilos.fila}>
        <View style={estilos.numero}>
          <Text style={estilos.numeroTexto}>{pendientes.length}</Text>
        </View>
        <View style={estilos.textos}>
          <Text style={estilos.titulo}>Evaluaciones pendientes de sincronizar</Text>
          <Text style={estilos.nota}>Guardadas en el teléfono</Text>
        </View>
        {pendientes.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar las evaluaciones pendientes"
            onPress={enviar}
            disabled={enviando}
            hitSlop={12}
            style={estilos.enviar}>
            {enviando ? (
              <ActivityIndicator color={Colores.morado} />
            ) : (
              <Text style={estilos.enviarTexto}>Enviar</Text>
            )}
          </Pressable>
        )}
      </View>

      {rechazadas.length > 0 && (
        <Text style={estilos.rechazadas}>
          {rechazadas.length} {rechazadas.length === 1 ? 'rechazada' : 'rechazadas'} por el servidor: toca para
          revisar
        </Text>
      )}
      {resultado && <Text style={estilos.resultado}>{resultado}</Text>}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colores.morado,
    borderRadius: 16,
    backgroundColor: Colores.blanco,
    padding: 14,
    gap: 8,
  },
  presionada: { opacity: 0.8 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numero: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colores.morado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: { fontSize: 20, fontWeight: '900', color: Colores.blanco },
  textos: { flex: 1 },
  titulo: { fontSize: 16, fontWeight: '800', color: Colores.texto },
  nota: { fontSize: 14, color: Colores.textoSuave },
  // Botón chico en apariencia, pero con área de toque de 48 px más hitSlop.
  enviar: { minHeight: 48, minWidth: 72, alignItems: 'center', justifyContent: 'center' },
  enviarTexto: { fontSize: 17, fontWeight: '900', color: Colores.morado },
  rechazadas: { fontSize: 15, fontWeight: '700', color: Colores.error },
  resultado: { fontSize: 15, fontWeight: '600', color: Colores.texto },
});
