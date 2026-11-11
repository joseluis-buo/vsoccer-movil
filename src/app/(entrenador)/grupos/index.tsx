import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pedirAlumnosDelGrupo, type AlumnoDelGrupo } from '@/api/entrenador';
import { useDatos } from '@/api/useDatos';
import { BotonRegresar } from '@/components/BotonRegresar';
import { ListaDeGrupos } from '@/components/entrenador/ListaDeGrupos';
import { FilaAlumno } from '@/components/entrenador/FilaAlumno';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { Colores } from '@/constants/colores';

// 05 · Alumnos del grupo. Se abre con ?grupo=MINI-LUN_MIE desde el Inicio.
// Si se entra por la pestaña sin elegir grupo, primero se muestran los grupos.
export default function PantallaAlumnosDelGrupo() {
  const { grupo, nombre } = useLocalSearchParams<{ grupo?: string; nombre?: string }>();

  if (!grupo) {
    return (
      <SafeAreaView edges={['top']} style={estilos.pantalla}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text style={estilos.titulo}>Elige un grupo</Text>
          <ListaDeGrupos />
        </ScrollView>
      </SafeAreaView>
    );
  }
  return <AlumnosDelGrupo grupo={grupo} nombre={nombre ?? grupo} />;
}

function AlumnosDelGrupo({ grupo, nombre }: { grupo: string; nombre: string }) {
  const { estado, reintentar } = useDatos(() => pedirAlumnosDelGrupo(grupo), grupo);
  const [busqueda, setBusqueda] = useState('');

  // Al regresar de una captura se vuelve a pedir la lista para que la marca
  // "Evaluado" la ponga el servidor. La primera vez no: ya la pidió useDatos.
  const primeraVez = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        return;
      }
      reintentar();
    }, [reintentar]),
  );

  function abrirCaptura(alumno: AlumnoDelGrupo) {
    router.push({
      pathname: '/grupos/captura',
      params: {
        alumno: alumno.id,
        nombre: alumno.nombre,
        grupoNombre: nombre,
        evaluadoHoy: alumno.evaluado_hoy ? 'si' : 'no',
      },
    });
  }

  const alumnos = estado.tipo === 'listo' ? estado.datos : [];
  const visibles = alumnos.filter((a) => sinAcentos(a.nombre).includes(sinAcentos(busqueda)));
  const evaluados = alumnos.filter((a) => a.evaluado_hoy).length;

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <BotonRegresar texto="Grupos" />
        <View>
          <Text style={estilos.titulo}>{nombre}</Text>
          {estado.tipo === 'listo' && (
            <Text style={estilos.resumen}>
              {evaluados} de {alumnos.length} evaluados hoy
            </Text>
          )}
        </View>

        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar alumno por nombre"
          placeholderTextColor={Colores.textoSuave}
          style={estilos.buscador}
          autoCorrect={false}
        />

        {estado.tipo === 'cargando' && <Cargando texto="Cargando alumnos…" />}
        {estado.tipo === 'error' && <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && alumnos.length === 0 && (
          <Vacio titulo="Grupo sin alumnos" explicacion="Este grupo todavía no tiene alumnos activos inscritos." />
        )}
        {estado.tipo === 'listo' && alumnos.length > 0 && visibles.length === 0 && (
          <Vacio titulo="Sin resultados" explicacion={`Ningún alumno del grupo se llama "${busqueda}".`} />
        )}
        {visibles.map((alumno) => (
          <FilaAlumno key={alumno.id} alumno={alumno} onPress={() => abrirCaptura(alumno)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Para que "sofia" encuentre a "Sofía": minúsculas y sin acentos. */
function sinAcentos(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 20, gap: 10, paddingBottom: 40 },
  titulo: { fontSize: 28, fontWeight: '900', color: Colores.texto },
  resumen: { fontSize: 16, color: Colores.textoSuave, marginTop: 2 },
  buscador: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colores.borde,
    backgroundColor: Colores.blanco,
    paddingHorizontal: 16,
    fontSize: 18,
    color: Colores.texto,
    marginBottom: 4,
  },
});
