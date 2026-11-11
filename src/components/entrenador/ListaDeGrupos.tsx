import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { pedirMisGrupos } from '@/api/entrenador';
import { useDatos } from '@/api/useDatos';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';

import { TarjetaGrupo } from './TarjetaGrupo';

// Los grupos del entrenador con sus tres estados. La usan el Inicio (04) y la
// pestaña Grupos cuando todavía no se elige uno.
export function ListaDeGrupos() {
  const { estado, reintentar } = useDatos(pedirMisGrupos);

  if (estado.tipo === 'cargando') return <Cargando texto="Cargando tus grupos…" />;
  if (estado.tipo === 'error') return <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />;
  if (estado.datos.length === 0) {
    return (
      <Vacio
        titulo="No tienes grupos asignados"
        explicacion="La escuela todavía no te asigna categorías ni horarios. Pídelo en la oficina."
      />
    );
  }

  return (
    <View style={estilos.lista}>
      {estado.datos.map((grupo) => (
        <TarjetaGrupo
          key={grupo.grupo}
          grupo={grupo}
          onPress={() => router.push({ pathname: '/grupos', params: { grupo: grupo.grupo, nombre: grupo.nombre } })}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: 12 },
});
