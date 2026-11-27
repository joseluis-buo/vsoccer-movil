import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { pedirMisHijos, type Hijo } from '@/api/familia';
import { useDatos } from '@/api/useDatos';
import { conCopiaLocal } from '@/cola/copiaLocal';
import { AvisoCopiaLocal } from '@/components/AvisoCopiaLocal';
import { BotonCambiarModo } from '@/components/BotonCambiarModo';
import { BotonCerrarSesion } from '@/components/BotonCerrarSesion';
import { EncabezadoPerfil, VersionDeLaApp } from '@/components/EncabezadoPerfil';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { Colores } from '@/constants/colores';
import { useSesion } from '@/sesion/SesionContext';

// 13 · Perfil (modo Familia): datos del tutor, sus hijos inscritos y cerrar
// sesión. Correo y teléfono del prototipo no están: ninguna respuesta de la
// API los trae, y la app no los inventa.
export default function PantallaPerfil() {
  const { perfil } = useSesion();
  const usuario = perfil?.usuario ?? '';
  // Misma copia que la pantalla Mis hijos: sin señal se ve la última lista.
  const { estado, reintentar } = useDatos(() => conCopiaLocal(usuario, 'mis-hijos', pedirMisHijos), usuario);
  if (!perfil) return null;

  return (
    <View style={estilos.pantalla}>
      <EncabezadoPerfil perfil={perfil} color={Colores.menta} colorTexto={Colores.moradoOscuro} />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.seccion}>HIJOS INSCRITOS</Text>
        {estado.tipo === 'cargando' && <Cargando texto="Buscando a tus hijos…" />}
        {estado.tipo === 'error' && <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && (
          <>
            {estado.datos.guardada && <AvisoCopiaLocal guardada={estado.datos.guardada} onRecargar={reintentar} />}
            {estado.datos.datos.length === 0 ? (
              <Vacio
                titulo="Aún no hay alumnos en tu cuenta"
                explicacion="Pide en recepción que vinculen a tu hijo con tu número."
              />
            ) : (
              estado.datos.datos.map((hijo) => <FilaHijo key={hijo.id} hijo={hijo} />)
            )}
          </>
        )}

        <View style={estilos.acciones}>
          <BotonCambiarModo />
          <BotonCerrarSesion />
        </View>
        <VersionDeLaApp />
      </ScrollView>
    </View>
  );
}

function FilaHijo({ hijo }: { hijo: Hijo }) {
  return (
    <View style={[estilos.fila, !hijo.activo && estilos.deBaja]}>
      <Text style={estilos.nombre}>{hijo.nombre}</Text>
      <Text style={estilos.grupo}>
        {hijo.categoria_nombre} · {hijo.horario_nombre}
      </Text>
      <Text style={estilos.folio}>
        Folio {hijo.folio}
        {!hijo.activo && ' · DADO DE BAJA'}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 12, paddingBottom: 40 },
  seccion: { fontSize: 14, fontWeight: '800', color: Colores.moradoOscuro, letterSpacing: 1 },
  fila: { backgroundColor: Colores.blanco, borderRadius: 14, padding: 16, gap: 2 },
  deBaja: { backgroundColor: '#ECE8F3' },
  nombre: { fontSize: 18, fontWeight: '800', color: Colores.texto },
  grupo: { fontSize: 15, color: Colores.textoSuave },
  folio: { fontSize: 14, fontWeight: '700', color: Colores.textoSuave },
  acciones: { gap: 12, marginTop: 12 },
});
