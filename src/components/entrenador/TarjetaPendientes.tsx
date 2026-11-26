import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCola } from '@/cola/useCola';
import { useEnvioManual } from '@/cola/useEnvioManual';
import { Colores } from '@/constants/colores';

// Tarjeta del Inicio (04): "Evaluaciones pendientes de sincronizar · Enviar".
// Solo aparece si hay algo en la cola. Tocar el texto lleva a Sincronizar.
export function TarjetaPendientes() {
  const { usuario, pendientes, rechazadas } = useCola();
  const { enviando, resultado, enviar } = useEnvioManual(usuario, pendientes.length);

  if (pendientes.length === 0 && rechazadas.length === 0 && !resultado) return null;

  const irASincronizar = () => router.push('/sincronizar');

  // La tarjeta es un View con dos zonas que se tocan por separado (ver y
  // "Enviar"). Si la tarjeta entera fuera un botón, "Enviar" quedaría como un
  // botón dentro de otro, y en web eso es HTML inválido (<button> en <button>).
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.fila}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver evaluaciones guardadas en el teléfono"
          onPress={irASincronizar}
          style={({ pressed }) => [estilos.ver, pressed && estilos.presionada]}>
          <View style={estilos.numero}>
            <Text style={estilos.numeroTexto}>{pendientes.length}</Text>
          </View>
          <View style={estilos.textos}>
            <Text style={estilos.titulo}>Evaluaciones pendientes de sincronizar</Text>
            <Text style={estilos.nota}>Guardadas en el teléfono</Text>
          </View>
        </Pressable>
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
        <Pressable accessibilityRole="link" onPress={irASincronizar} style={estilos.enlace}>
          <Text style={estilos.rechazadas}>
            {rechazadas.length} {rechazadas.length === 1 ? 'rechazada' : 'rechazadas'} por el servidor: toca para
            revisar
          </Text>
        </Pressable>
      )}
      {resultado && <Text style={estilos.resultado}>{resultado}</Text>}
    </View>
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
  ver: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  enlace: { minHeight: 48, justifyContent: 'center' },
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
