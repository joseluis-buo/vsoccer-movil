import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BotonCambiarModo } from '@/components/BotonCambiarModo';
import { BotonCerrarSesion } from '@/components/BotonCerrarSesion';
import { EncabezadoPerfil, VersionDeLaApp } from '@/components/EncabezadoPerfil';
import { ListaDeGrupos } from '@/components/entrenador/ListaDeGrupos';
import { Colores } from '@/constants/colores';
import { useSesion } from '@/sesion/SesionContext';

// Perfil del entrenador: quién es, sus grupos y cerrar sesión. Los grupos
// salen de la misma copia local que el Inicio, así que se ven sin señal.
export default function PantallaPerfilEntrenador() {
  const { perfil } = useSesion();
  if (!perfil) return null;

  return (
    <View style={estilos.pantalla}>
      <EncabezadoPerfil perfil={perfil} color={Colores.morado} colorTexto={Colores.blanco} />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.seccion}>MIS GRUPOS</Text>
        <ListaDeGrupos />
        <View style={estilos.acciones}>
          <BotonCambiarModo />
          <BotonCerrarSesion />
        </View>
        <VersionDeLaApp />
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 12, paddingBottom: 40 },
  seccion: { fontSize: 14, fontWeight: '800', color: Colores.morado, letterSpacing: 1 },
  acciones: { gap: 12, marginTop: 12 },
});
