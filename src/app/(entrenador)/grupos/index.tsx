import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pedirAlumnosDelGrupo, type AlumnoDelGrupo } from '@/api/entrenador';
import { useDatos } from '@/api/useDatos';
import { conCopiaLocal, type ConCopia } from '@/cola/copiaLocal';
import { useCola } from '@/cola/useCola';
import { AvisoCopiaLocal } from '@/components/AvisoCopiaLocal';
import { BotonRegresar } from '@/components/BotonRegresar';
import { ListaDeGrupos } from '@/components/entrenador/ListaDeGrupos';
import { FilaAlumno } from '@/components/entrenador/FilaAlumno';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { Colores } from '@/constants/colores';
import { fechaDeHoy, fechaLocal } from '@/utils/fechas';

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
  const { usuario, pendientes } = useCola();
  // Sin señal se usa la última lista de este grupo guardada en el teléfono.
  const { estado, reintentar } = useDatos(
    () => conCopiaLocal(usuario, `alumnos?grupo=${grupo}`, () => pedirAlumnosDelGrupo(grupo)),
    grupo,
  );
  const [busqueda, setBusqueda] = useState('');
  // Alumnos con una evaluación DE HOY esperando señal en la cola del teléfono.
  // Una de otro día no cuenta: hoy todavía le falta la suya.
  const hoy = fechaDeHoy();
  const enTelefono = new Set(pendientes.filter((p) => p.fecha === hoy).map((p) => p.alumno));

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
        evaluadoHoy: alumno.evaluado_hoy ? 'si' : enTelefono.has(alumno.id) ? 'telefono' : 'no',
      },
    });
  }

  const copia = estado.tipo === 'listo' ? estado.datos : null;
  const alumnos = copia ? marcasVigentes(copia, hoy) : [];
  const visibles = alumnos.filter((a) => sinAcentos(a.nombre).includes(sinAcentos(busqueda)));
  const evaluados = alumnos.filter((a) => a.evaluado_hoy).length;
  const guardadosEnTelefono = alumnos.filter((a) => !a.evaluado_hoy && enTelefono.has(a.id)).length;

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <BotonRegresar texto="Grupos" />
        <View>
          <Text style={estilos.titulo}>{nombre}</Text>
          {estado.tipo === 'listo' && (
            <Text style={estilos.resumen}>
              {evaluados} de {alumnos.length} evaluados hoy
              {guardadosEnTelefono > 0 && ` · ${guardadosEnTelefono} en teléfono`}
            </Text>
          )}
        </View>

        {copia?.guardada && <AvisoCopiaLocal guardada={copia.guardada} onRecargar={reintentar} />}

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
          <FilaAlumno
            key={alumno.id}
            alumno={alumno}
            enTelefono={enTelefono.has(alumno.id)}
            onPress={() => abrirCaptura(alumno)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Una lista guardada otro día trae el "Evaluado" de ESE día: hoy no vale.
 * Se quita la marca y, cuando vuelva la señal, el servidor pone la de hoy.
 */
function marcasVigentes({ datos, guardada }: ConCopia<AlumnoDelGrupo[]>, hoy: string) {
  if (!guardada || fechaLocal(new Date(guardada)) === hoy) return datos;
  return datos.map((alumno) => ({ ...alumno, evaluado_hoy: false, evaluacion_hoy: null }));
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
