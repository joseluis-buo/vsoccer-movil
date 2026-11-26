import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { pedirMisGrupos } from '@/api/entrenador';
import { useDatos } from '@/api/useDatos';
import { conCopiaLocal } from '@/cola/copiaLocal';
import { AvisoCopiaLocal } from '@/components/AvisoCopiaLocal';
import { Cargando, ErrorConReintento, Vacio } from '@/components/Estados';
import { useSesion } from '@/sesion/SesionContext';

import { TarjetaGrupo } from './TarjetaGrupo';

// Los grupos del entrenador con sus tres estados. La usan el Inicio (04) y la
// pestaña Grupos cuando todavía no se elige uno. Sin señal se muestra la
// última lista guardada en el teléfono.
export function ListaDeGrupos() {
  const { perfil } = useSesion();
  const usuario = perfil?.usuario ?? '';
  const { estado, reintentar } = useDatos(() => conCopiaLocal(usuario, 'mis-grupos', pedirMisGrupos), usuario);

  if (estado.tipo === 'cargando') return <Cargando texto="Cargando tus grupos…" />;
  if (estado.tipo === 'error') return <ErrorConReintento mensaje={estado.mensaje} onReintentar={reintentar} />;

  const { datos: grupos, guardada } = estado.datos;
  return (
    <View style={estilos.lista}>
      {guardada && <AvisoCopiaLocal guardada={guardada} onRecargar={reintentar} />}
      {grupos.length === 0 ? (
        <Vacio
          titulo="No tienes grupos asignados"
          explicacion="La escuela todavía no te asigna categorías ni horarios. Pídelo en la oficina."
        />
      ) : (
        grupos.map((grupo) => (
          <TarjetaGrupo
            key={grupo.grupo}
            grupo={grupo}
            onPress={() => router.push({ pathname: '/grupos', params: { grupo: grupo.grupo, nombre: grupo.nombre } })}
          />
        ))
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: 12 },
});
