import { useCallback, useEffect, useEffectEvent, useState } from 'react';

import { ErrorApi } from './cliente';

// Toda pantalla que pide datos pasa por tres estados. Este hook los lleva
// para que cada pantalla solo decida qué dibujar en cada uno.
export type EstadoDatos<T> =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; datos: T };

/**
 * Ejecuta `pedir` al montar la pantalla y cada vez que cambie `llave`
 * (p. ej. el id del alumno). `reintentar` vuelve a pedir: tras un error, o
 * para refrescar al regresar a una pantalla.
 */
export function useDatos<T>(pedir: () => Promise<T>, llave: string | number = '') {
  const [intento, setIntento] = useState(0);
  // Cada respuesta se guarda junto con la petición a la que pertenece.
  const [respuesta, setRespuesta] = useState<{ de: string; estado: EstadoDatos<T> } | null>(null);
  const peticionActual = `${llave}#${intento}`;

  // useEffectEvent: siempre usa la versión más nueva de `pedir` sin que el
  // efecto se vuelva a disparar en cada render.
  const ejecutar = useEffectEvent(() => pedir());

  useEffect(() => {
    ejecutar()
      .then((datos) => setRespuesta({ de: peticionActual, estado: { tipo: 'listo', datos } }))
      .catch((error) =>
        setRespuesta({ de: peticionActual, estado: { tipo: 'error', mensaje: mensajeDeError(error) } }),
      );
  }, [peticionActual]);

  // Si la respuesta guardada es de otra petición (otro alumno, o antes de
  // tocar "Reintentar"), todavía se está cargando. Así nunca se pintan datos
  // de un niño en la ficha de otro.
  const estado: EstadoDatos<T> = respuesta?.de === peticionActual ? respuesta.estado : { tipo: 'cargando' };

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  return { estado, reintentar };
}

/** El "detail" del servidor si lo hay; si no, un texto genérico. */
function mensajeDeError(error: unknown) {
  if (error instanceof ErrorApi) return error.message;
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}
