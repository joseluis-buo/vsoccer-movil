import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { leerCola } from '@/cola/cola';
import { Colores } from '@/constants/colores';
import { useSesion } from '@/sesion/SesionContext';

import { Boton } from './Boton';

type SinEnviar = { pendientes: number; rechazadas: number };

// Al borrar la sesión, la navegación regresa sola al login. Si hay
// evaluaciones en la cola, antes se avisa y se pide confirmar.
// (Se confirma en la pantalla y no con Alert.alert, que no funciona en web.)
export function BotonCerrarSesion() {
  const { perfil, cerrarSesion } = useSesion();
  const [aviso, setAviso] = useState<SinEnviar | null>(null);

  async function alTocar() {
    // Se lee la cola en este momento, no lo que la pantalla leyó al abrir.
    const cola = await leerCola(perfil?.usuario ?? '').catch(() => []);
    const pendientes = cola.filter((fila) => fila.estado === 'pendiente').length;
    const rechazadas = cola.length - pendientes;
    if (cola.length === 0) {
      await cerrarSesion();
    } else {
      setAviso({ pendientes, rechazadas });
    }
  }

  if (!aviso) {
    return <Boton titulo="Cerrar sesión" variante="contorno" onPress={alTocar} />;
  }

  return (
    <View style={estilos.caja} accessibilityRole="alert">
      <Text style={estilos.titulo}>{textoDelTitulo(aviso)}</Text>
      <Text style={estilos.texto}>
        {aviso.pendientes + aviso.rechazadas === 1
          ? 'Se queda guardada en este teléfono y te espera cuando vuelvas a entrar con tu cuenta. Otra persona que entre aquí no la ve ni la envía.'
          : 'Se quedan guardadas en este teléfono y te esperan cuando vuelvas a entrar con tu cuenta. Otra persona que entre aquí no las ve ni las envía.'}
      </Text>
      <Boton titulo="Sí, cerrar sesión" onPress={cerrarSesion} />
      <Boton titulo="Cancelar" variante="contorno" onPress={() => setAviso(null)} />
    </View>
  );
}

/** "Tienes 2 evaluaciones sin enviar y 1 rechazada por el servidor." */
function textoDelTitulo({ pendientes, rechazadas }: SinEnviar) {
  const partes: string[] = [];
  if (pendientes > 0) partes.push(`${pendientes} ${pendientes === 1 ? 'evaluación sin enviar' : 'evaluaciones sin enviar'}`);
  if (rechazadas > 0) partes.push(`${rechazadas} ${rechazadas === 1 ? 'rechazada' : 'rechazadas'} por el servidor`);
  return `Tienes ${partes.join(' y ')}.`;
}

const estilos = StyleSheet.create({
  caja: {
    backgroundColor: Colores.blanco,
    borderLeftWidth: 5,
    borderLeftColor: Colores.morado,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  titulo: { fontSize: 18, fontWeight: '800', color: Colores.texto },
  texto: { fontSize: 15, color: Colores.textoSuave, lineHeight: 21 },
});
