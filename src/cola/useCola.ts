import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useSesion } from '@/sesion/SesionContext';

import { leerCola, type EvaluacionEnCola } from './cola';

/**
 * La cola del entrenador que tiene la sesión abierta. Se vuelve a leer cada
 * vez que la pantalla aparece (p. ej. al regresar de una captura) y cuando
 * la pantalla llama a `recargar`.
 */
export function useCola() {
  const { perfil } = useSesion();
  // Sin sesión no hay usuario y la consulta no encuentra ninguna fila.
  const usuario = perfil?.usuario ?? '';
  const [filas, setFilas] = useState<EvaluacionEnCola[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(() => {
    leerCola(usuario)
      .then((leidas) => {
        setFilas(leidas);
        setError(null);
      })
      .catch((e) => setError(`No se pudo leer la cola del teléfono: ${(e as Error).message}`));
  }, [usuario]);

  useFocusEffect(recargar);

  const pendientes = filas.filter((fila) => fila.estado === 'pendiente');
  const rechazadas = filas.filter((fila) => fila.estado === 'rechazada');
  return { usuario, pendientes, rechazadas, error, recargar };
}
