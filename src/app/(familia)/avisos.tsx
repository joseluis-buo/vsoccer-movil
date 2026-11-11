import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pedirComunicados, type Comunicado } from '@/api/familia';
import { useDatos } from '@/api/useDatos';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { Colores } from '@/constants/colores';
import { formatearFechaHora } from '@/utils/fechas';

// 12 · Avisos. La API ya los manda filtrados (generales + las categorías de
// los hijos activos) y del más nuevo al más viejo.
export default function PantallaAvisos() {
  const { estado, reintentar } = useDatos(pedirComunicados);

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.titulo}>Avisos</Text>

        {estado.tipo === 'cargando' && <Cargando texto="Cargando avisos…" />}
        {estado.tipo === 'error' && <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && estado.datos.length === 0 && (
          <Vacio
            titulo="No hay avisos"
            explicacion="La escuela no ha publicado comunicados para ti ni para las categorías de tus hijos."
          />
        )}
        {estado.tipo === 'listo' && estado.datos.map((aviso) => <TarjetaAviso key={aviso.id} aviso={aviso} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function TarjetaAviso({ aviso }: { aviso: Comunicado }) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.encabezado}>
        {aviso.categoria ? `COMUNICADO · ${aviso.categoria}` : 'COMUNICADO GENERAL'} ·{' '}
        {formatearFechaHora(aviso.publicado).toUpperCase()}
      </Text>
      <Text style={estilos.avisoTitulo}>{aviso.titulo}</Text>
      <Text style={estilos.cuerpo}>{aviso.cuerpo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 14, paddingBottom: 40 },
  titulo: { fontSize: 32, fontWeight: '900', color: Colores.texto, marginTop: 8 },
  tarjeta: {
    backgroundColor: Colores.blanco,
    borderRadius: 18,
    padding: 18,
    gap: 6,
    borderLeftWidth: 5,
    borderLeftColor: Colores.menta,
  },
  encabezado: { fontSize: 13, fontWeight: '800', color: Colores.textoSuave, letterSpacing: 0.5 },
  avisoTitulo: { fontSize: 19, fontWeight: '800', color: Colores.texto },
  cuerpo: { fontSize: 16, lineHeight: 23, color: Colores.texto },
});
